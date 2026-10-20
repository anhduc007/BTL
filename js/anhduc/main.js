/* =========================================================
   GANG THÉP GYM — js/main.js
   Người phụ trách: Lò Anh Đức (trưởng nhóm)
   Điều hướng giữa các trang (router theo #hash), header, chế độ
   sáng/tối, bộ lắng nghe sự kiện chung và khởi động ứng dụng.
   File này được nạp CUỐI CÙNG, sau khi các module đã đăng ký sự kiện.
   ========================================================= */
'use strict';

/* ---------- 1. ĐIỀU HƯỚNG ---------- */
const VIEWS = ['home', 'login', 'register', 'account', 'admin'];
let view = 'home';
let afterAuth = null;     // việc cần làm tiếp sau khi đăng nhập: { plan } | { trial } | { view }
let pendingScroll = null; // section cần cuộn tới khi quay về trang chủ
const ui = { chatOpen: false, adminTab: 'overview', adminConv: null, memberQ: '' };

function go(v) { if (location.hash === '#' + v) route(); else location.hash = v; }

function route() {
  let v = location.hash.slice(1) || 'home';
  if (!VIEWS.includes(v)) v = 'home';
  const u = me();
  if (v === 'account' && !u) { afterAuth = afterAuth || { view: 'account' }; return location.replace('#login'); }
  if (v === 'admin' && (!u || u.role !== 'admin')) return location.replace(u ? '#account' : '#login');
  if (v === 'account' && u.role === 'admin') return location.replace('#admin');
  if ((v === 'login' || v === 'register') && u) return location.replace(u.role === 'admin' ? '#admin' : '#account');
  view = v;
  $$('main[data-view]').forEach(m => { m.hidden = m.dataset.view !== v; });
  renderView();
  renderHeader();
  renderChat();
  closeMobileMenu();
  if (pendingScroll) { const id = pendingScroll; pendingScroll = null; requestAnimationFrame(() => scrollToSection(id)); }
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderView() {
  ({ home: renderHome, login: renderLogin, register: renderRegister, account: renderAccount, admin: renderAdmin })[view]();
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function renderHeader() {
  const u = me();
  const area = $('#authArea'), mob = $('#mobileAuth');
  if (!u) {
    area.innerHTML = `<button class="btn btn-ghost hide-m" data-go="login">Đăng nhập</button><button class="btn btn-primary hide-m" data-go="register">Đăng ký</button>`;
    mob.innerHTML = `<button class="btn" data-go="login" style="flex:1">Đăng nhập</button><button class="btn btn-primary" data-go="register" style="flex:1">Đăng ký</button>`;
  } else {
    const target = u.role === 'admin' ? 'admin' : 'account';
    area.innerHTML = `<a class="user-chip" href="#${target}" title="${u.role === 'admin' ? 'Trang quản trị' : 'Tài khoản của tôi'}">${avatar(u)}<span>${esc(u.role === 'admin' ? 'Quản trị' : u.name)}</span></a>
      <button class="btn btn-ghost btn-icon hide-m" data-action="logout" aria-label="Đăng xuất" title="Đăng xuất">${icon('logout')}</button>`;
    mob.innerHTML = `<a class="btn" href="#${target}" style="flex:1">${u.role === 'admin' ? 'Trang quản trị' : 'Gói của tôi'}</a><button class="btn" data-action="logout" style="flex:1">${icon('logout')}Đăng xuất</button>`;
  }
  $('#themeBtn').innerHTML = icon(isDark() ? 'sun' : 'moon');
  $('#menuBtn').innerHTML = icon($('#mobileMenu').hidden ? 'menu' : 'x');
}
function closeMobileMenu() { $('#mobileMenu').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); $('#menuBtn').innerHTML = icon('menu'); }

// Giao diện sáng/tối
function isDark() { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }

/* ---------- 2. BỘ LẮNG NGHE SỰ KIỆN CHUNG ---------- */
document.addEventListener('click', e => {
  // Chuyển trang: <button data-go="login">
  const goEl = e.target.closest('[data-go]');
  if (goEl) { e.preventDefault(); closeModal(); return go(goEl.dataset.go); }
  // Cuộn tới mục trên trang chủ: <button data-scroll="plans">
  const sc = e.target.closest('[data-scroll]');
  if (sc) {
    e.preventDefault(); closeModal(); closeMobileMenu();
    if (ui.chatOpen && sc.closest('#chatPanel')) { ui.chatOpen = false; renderChat(); }
    if (view !== 'home') { pendingScroll = sc.dataset.scroll; go('home'); } else scrollToSection(sc.dataset.scroll);
    return;
  }
  // Các hành động do module đăng ký: <button data-action="...">
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el, e);
});

document.addEventListener('submit', e => {
  const handler = FORMS[e.target.id];
  if (handler) { e.preventDefault(); handler(e.target); }
});

document.addEventListener('input', e => {
  const handler = INPUTS[e.target.id];
  if (handler) handler(e.target);
});

document.addEventListener('keydown', e => {
  for (const handler of KEYS) if (handler(e)) return;
});

$('#menuBtn').addEventListener('click', () => {
  const m = $('#mobileMenu'); m.hidden = !m.hidden;
  $('#menuBtn').setAttribute('aria-expanded', String(!m.hidden)); $('#menuBtn').innerHTML = icon(m.hidden ? 'menu' : 'x');
});
$('#themeBtn').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; lsSet(KEY + '-theme', next);
  $('#themeBtn').innerHTML = icon(isDark() ? 'sun' : 'moon');
});

// Khôi phục dữ liệu mẫu (nút ở cuối trang)
onAction({
  'reset': () => confirmModal('Khôi phục dữ liệu mẫu?', 'Mọi tài khoản, gói tập và tin nhắn bạn đã tạo sẽ bị thay bằng dữ liệu mẫu ban đầu.', 'Khôi phục', async () => {
    db = await seed(); save(); lsSet(SESSION_KEY, ''); ui.chatOpen = false; toast('Đã khôi phục dữ liệu mẫu.', true); go('home'); renderPlans();
  })
});

// Đồng bộ giữa các tab: mở trang quản trị ở tab khác sẽ thấy tin nhắn mới ngay
window.addEventListener('storage', e => {
  if (e.key === KEY && e.newValue) { try { db = JSON.parse(e.newValue); } catch (err) { return; } if (view !== 'login' && view !== 'register') renderView(); renderChat(); renderHeader(); }
  if (e.key === SESSION_KEY) route();
});
window.addEventListener('hashchange', route);

/* ---------- 3. KHỞI ĐỘNG ---------- */
(async function init() {
  const th = lsGet(KEY + '-theme'); if (th) document.documentElement.dataset.theme = th;
  runSplash();
  db = await loadDB();
  route();
  setTimeout(countUp, reducedMotion() ? 0 : 2900);
  setTimeout(showPromo, reducedMotion() ? 600 : 3800);
})();
