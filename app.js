/* =========================================================
   GANG THÉP GYM — app.js
   Mục lục:
     1. Cấu hình phòng tập
     2. Tiện ích (ngày tháng, tiền tệ, icon, lưu trữ)
     3. Cơ sở dữ liệu (localStorage) + dữ liệu mẫu
     4. Nghiệp vụ gói tập (đăng ký, đổi gói, gia hạn, hủy)
     5. Điều hướng (router theo #hash)
     6. Trang chủ: bảng giá, lịch lớp, liên hệ
     7. Đăng nhập / đăng ký
     8. Trang tài khoản hội viên
     9. Trang quản trị
    10. Chat với quản lý
    11. Modal, toast, quảng cáo khai trương, hiệu ứng
    12. Xử lý sự kiện + khởi động
   ========================================================= */
'use strict';

/* ---------- 1. CẤU HÌNH ---------- */
const GYM = {
  name: 'Gang Thép Gym',
  address: 'Số 68 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
  hotline: '0987 654 321',
  hotlineTel: '0987654321',
  email: 'hotro@gangthepgym.vn',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('68 Trần Thái Tông, Cầu Giấy, Hà Nội'),
  hours: [['Thứ 2 – Chủ nhật', '5:00 – 22:00'], ['Ngày lễ, Tết', '7:00 – 18:00']]
};
const PROMO = { plan: 'p4', percent: 30, end: '2026-10-31' };
const KEY = 'gangthep-web-v1';
const SESSION_KEY = 'gangthep-web-session';

const TRIAL = { id: 'trial', name: 'Vé tập thử', weight: '3 NGÀY', months: 0, days: 3, price: 0, color: 'green', perks: [] };

const CLASSES = [
  ['Powerlifting cơ bản', 1, '06:00', 60, 'Quốc Bảo', 'red'], ['Yoga buổi sáng', 1, '07:30', 60, 'Thu Hà', 'blue'], ['HIIT đốt mỡ', 1, '18:30', 45, 'Minh Khoa', 'yellow'],
  ['Boxing nhập môn', 2, '19:00', 60, 'Hoàng Long', 'green'], ['Pilates core', 3, '07:00', 50, 'Thu Hà', 'blue'], ['Kỹ thuật Squat & Deadlift', 3, '18:00', 75, 'Quốc Bảo', 'red'],
  ['HIIT đốt mỡ', 4, '18:30', 45, 'Minh Khoa', 'yellow'], ['Kickfit', 5, '19:00', 60, 'Hoàng Long', 'green'], ['Bench Press Clinic', 6, '17:30', 60, 'Quốc Bảo', 'red'],
  ['Yoga thư giãn', 6, '20:00', 60, 'Thu Hà', 'blue'], ['Circuit cuối tuần', 7, '08:00', 60, 'Minh Khoa', 'yellow'], ['Boxing sparring', 7, '16:00', 90, 'Hoàng Long', 'green']
];

const METHODS = [
  ['counter', 'Thanh toán tại quầy', 'Tiền mặt hoặc quẹt thẻ khi đến tập'],
  ['bank', 'Chuyển khoản ngân hàng', 'Ghi nội dung: mã hội viên + tên gói'],
  ['momo', 'Ví điện tử MoMo', 'Quét mã QR tại quầy lễ tân']
];
const SUB_LABEL = { active: 'Đang hoạt động', pending: 'Chờ xác nhận', expired: 'Hết hạn', changed: 'Đã đổi gói', cancelled: 'Đã hủy', rejected: 'Bị từ chối', done: 'Đã gia hạn' };
const KIND_LABEL = { new: 'Đăng ký mới', change: 'Đổi gói', renew: 'Gia hạn', trial: 'Tập thử' };

/* ---------- 2. TIỆN ÍCH ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 864e5;
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
const fmtDate = s => { const d = typeof s === 'string' ? parse(s) : new Date(s); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
const fmtTime = ts => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const vnd = n => Math.round(n).toLocaleString('vi-VN') + ' ₫';
const shortPrice = n => n < 1e6 ? `${n / 1000}K` : `${(n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}TR`;
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const initials = name => { const p = String(name).trim().split(/\s+/); return (p.length > 1 ? p[p.length - 2][0] + p[p.length - 1][0] : p[0].slice(0, 2)).toUpperCase(); };
const firstName = name => String(name).trim().split(/\s+/).pop();
const plateVar = c => `var(--plate-${c})`;
const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const dayIndex = d => d.getDay() === 0 ? 7 : d.getDay();
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICONS = {
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 10h8M8 13h5"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>'
};
const icon = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

// localStorage có thể bị chặn (chế độ ẩn danh, trình duyệt cũ) → luôn bọc try/catch
const memoryStore = {};
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return memoryStore[k] ?? null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { memoryStore[k] = v; } };
const ssGet = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
const ssSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } };

// Mã hoá mật khẩu bằng SHA-256 (không lưu mật khẩu gốc). Nếu trình duyệt không hỗ trợ thì dùng hàm băm đơn giản.
async function hashPassword(pw) {
  const text = 'gangthep::' + pw;
  try {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) { /* dùng phương án dự phòng */ }
  let h = 5381; for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return 'f' + h.toString(16);
}

/* ---------- 3. CƠ SỞ DỮ LIỆU ---------- */
let db = null;

function defaultPlans() {
  return [
    { id: 'p1', name: 'Đĩa Xanh lá', weight: '10 KG', months: 1, price: 450000, color: 'green', perks: ['Tập không giới hạn khung giờ', 'Tủ đồ theo ngày', 'Hướng dẫn máy buổi đầu'] },
    { id: 'p2', name: 'Đĩa Vàng', weight: '15 KG', months: 3, price: 1200000, color: 'yellow', perks: ['Tập không giới hạn khung giờ', 'Tủ đồ theo ngày', '1 lần đo InBody'] },
    { id: 'p3', name: 'Đĩa Xanh dương', weight: '20 KG', months: 6, price: 2200000, color: 'blue', featured: true, perks: ['Quyền lợi gói Vàng', 'Miễn phí tất cả lớp nhóm', '2 lần đo InBody'] },
    { id: 'p4', name: 'Đĩa Đỏ', weight: '25 KG', months: 12, price: 3900000, color: 'red', perks: ['Quyền lợi gói Xanh dương', '4 buổi PT 1 kèm 1', 'Khăn và nước miễn phí', 'Tủ đồ cố định'] }
  ];
}

async function seed() {
  const t = today(), now = Date.now();
  const plans = defaultPlans();
  const pass123 = await hashPassword('123456');
  const users = [
    { id: 'u1', code: 'GT0001', name: 'Quản lý Gang Thép', email: 'admin@gangthep.vn', phone: '0987654321', role: 'admin', pass: await hashPassword('admin123'), createdAt: +addDays(t, -200) },
    { id: 'u2', code: 'GT0002', name: 'Nguyễn Văn An', email: 'member@gangthep.vn', phone: '0912000101', role: 'member', pass: pass123, createdAt: +addDays(t, -45) },
    { id: 'u3', code: 'GT0003', name: 'Trần Thu Trang', email: 'trang.tt@gmail.com', phone: '0934000404', role: 'member', pass: pass123, createdAt: +addDays(t, -25) },
    { id: 'u4', code: 'GT0004', name: 'Lê Hoàng Nam', email: 'nam.lh@gmail.com', phone: '0903000303', role: 'member', pass: pass123, createdAt: +addDays(t, -75) },
    { id: 'u5', code: 'GT0005', name: 'Phạm Minh Thư', email: 'thu.pm@gmail.com', phone: '0966000606', role: 'member', pass: pass123, createdAt: +addDays(t, -130) }
  ];
  const mk = (id, userId, planId, ago, status, kind, extra = {}) => {
    const p = plans.find(x => x.id === planId), start = addDays(t, -ago);
    return { id, userId, planId, kind, status, start: iso(start), end: iso(addMonths(start, p.months)), value: p.price, amount: p.price, method: 'counter', createdAt: +start, confirmedAt: status === 'pending' ? null : +start, ...extra };
  };
  const subs = [
    mk('s1', 'u2', 'p3', 40, 'active', 'new'),
    mk('s2', 'u3', 'p1', 20, 'active', 'new'),
    mk('s4', 'u4', 'p1', 70, 'active', 'new'),
    mk('s6', 'u5', 'p4', 125, 'active', 'new')
  ];
  const s2 = subs[1];
  subs.push(mk('s3', 'u3', 'p2', 0, 'pending', 'change', { replaces: 's2', amount: Math.max(0, 1200000 - creditOf(s2)), method: 'momo', createdAt: now - 2 * 3600e3 }));
  subs.push(mk('s5', 'u4', 'p2', 0, 'pending', 'new', { method: 'bank', createdAt: now - 3600e3 }));
  const messages = [
    { id: 'm1', userId: 'u2', from: 'user', text: 'Chào anh/chị, gói Xanh dương có được học lớp Yoga không ạ?', at: now - 2 * DAY - 3 * 3600e3, readByAdmin: true, readByUser: true },
    { id: 'm2', userId: 'u2', from: 'admin', text: 'Chào An, gói Xanh dương được học miễn phí tất cả lớp nhóm, kể cả Yoga nhé. Em xem lịch ở mục Lịch lớp trên trang chủ.', at: now - 2 * DAY - 2.8 * 3600e3, readByAdmin: true, readByUser: true },
    { id: 'm3', userId: 'u2', from: 'user', text: 'Dạ em cảm ơn ạ!', at: now - 2 * DAY - 2.7 * 3600e3, readByAdmin: true, readByUser: true },
    { id: 'm4', userId: 'u4', from: 'user', text: 'Em đã chuyển khoản gói Vàng rồi, nhờ quản lý xác nhận giúp em ạ.', at: now - 50 * 60e3, readByAdmin: false, readByUser: true }
  ];
  const contacts = [
    { id: 'c1', name: 'Hoàng Đức Minh', phone: '0977000505', topic: 'Đăng ký tập thử', message: 'Mình muốn tập thử vào tối thứ 3 tuần sau, có cần mang gì không?', at: now - 3 * 3600e3, done: false }
  ];
  return { version: 1, plans, users, subs, messages, contacts, seq: users.length };
}

async function loadDB() {
  const raw = lsGet(KEY);
  if (raw) { try { return JSON.parse(raw); } catch (e) { /* dữ liệu hỏng → tạo mới */ } }
  const fresh = await seed();
  lsSet(KEY, JSON.stringify(fresh));
  return fresh;
}
const save = () => lsSet(KEY, JSON.stringify(db));

const me = () => { const id = lsGet(SESSION_KEY); return id ? db.users.find(u => u.id === id) || null : null; };
const userById = id => db.users.find(u => u.id === id);
const planById = id => id === 'trial' ? TRIAL : db.plans.find(p => p.id === id);
const userColor = u => u.role === 'admin' ? 'var(--ink)' : plateVar(['red', 'blue', 'yellow', 'green'][(parseInt(u.code.slice(2), 10) || 0) % 4]);
const avatar = (u, cls = '') => `<span class="avatar ${cls}" style="--c:${userColor(u)}">${esc(initials(u.name))}</span>`;

/* ---------- 4. NGHIỆP VỤ GÓI TẬP ---------- */
const promoActive = () => today() <= parse(PROMO.end);
const planPrice = p => (promoActive() && p.id === PROMO.plan) ? Math.round(p.price * (100 - PROMO.percent) / 100 / 1000) * 1000 : p.price;
const subState = s => (s.status === 'active' && parse(s.end) < today()) ? 'expired' : s.status;
const daysLeft = s => Math.round((parse(s.end) - today()) / DAY);
const totalDays = s => Math.max(1, Math.round((parse(s.end) - parse(s.start)) / DAY));
// Giá trị còn lại của gói = giá trị gói × số ngày còn lại / tổng số ngày
function creditOf(s) {
  const left = Math.max(0, Math.min(totalDays(s), Math.round((parse(s.end) - Math.max(+today(), +parse(s.start))) / DAY)));
  return Math.round((s.value || 0) * left / totalDays(s) / 1000) * 1000;
}
const activeSub = uid => db.subs.filter(s => s.userId === uid && subState(s) === 'active').sort((a, b) => b.end.localeCompare(a.end))[0] || null;
const pendingSub = uid => db.subs.find(s => s.userId === uid && s.status === 'pending') || null;
const pillClass = st => st === 'active' ? 'active' : st === 'pending' ? 'pending' : 'expired';
const pill = st => `<span class="pill ${pillClass(st)}">${SUB_LABEL[st]}</span>`;
const planTag = p => p ? `<span class="plan-tag"><span class="plate-dot" style="--c:${plateVar(p.color)}"></span>${esc(p.name)}</span>` : '—';
const methodName = m => (METHODS.find(x => x[0] === m) || [, 'Miễn phí'])[1];

function systemMessage(userId, text) {
  db.messages.push({ id: uid('m'), userId, from: 'admin', text, at: Date.now(), readByAdmin: true, readByUser: false, auto: true });
}

// Quản lý xác nhận yêu cầu (đã nhận thanh toán)
function confirmRequest(id) {
  const s = db.subs.find(x => x.id === id); if (!s || s.status !== 'pending') return;
  const p = planById(s.planId), t = today();
  if (s.kind === 'renew') {
    const target = db.subs.find(x => x.id === s.target);
    if (target && subState(target) === 'active') {
      s.start = target.end;
      target.end = iso(addMonths(parse(target.end), p.months));
      s.end = target.end; s.status = 'done';
    } else { s.kind = 'new'; }
  }
  if (s.kind === 'change') {
    const old = db.subs.find(x => x.id === s.replaces);
    if (old && subState(old) === 'active') { old.status = 'changed'; old.changedAt = Date.now(); }
    s.start = iso(t);
  }
  if (s.kind === 'new' || s.kind === 'change') {
    if (parse(s.start) < t) s.start = iso(t);
    s.end = iso(addMonths(parse(s.start), p.months));
    s.status = 'active';
  }
  s.confirmedAt = Date.now();
  systemMessage(s.userId, s.kind === 'renew'
    ? `Quản lý đã xác nhận gia hạn ${p.name}. Hạn mới của bạn là ${fmtDate(s.end)}.`
    : `Gói ${p.name} của bạn đã được kích hoạt, có hiệu lực từ ${fmtDate(s.start)} đến ${fmtDate(s.end)}. Chúc bạn tập luyện hiệu quả!`);
  save();
}
function rejectRequest(id, reason) {
  const s = db.subs.find(x => x.id === id); if (!s) return;
  s.status = 'rejected'; s.rejectedAt = Date.now();
  systemMessage(s.userId, `Yêu cầu ${KIND_LABEL[s.kind].toLowerCase()} gói ${planById(s.planId).name} chưa được duyệt${reason ? ': ' + reason : '.'} Bạn có thể nhắn lại cho quản lý để được hỗ trợ.`);
  save();
}

/* ---------- 5. ĐIỀU HƯỚNG ---------- */
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

/* ---------- 6. TRANG CHỦ ---------- */
function renderHome() { renderPlans(); renderSchedule(); renderContact(); }

function renderPlans() {
  const u = me(), act = u && u.role !== 'admin' ? activeSub(u.id) : null;
  $('#planGrid').innerHTML = db.plans.map(p => {
    const promo = promoActive() && p.id === PROMO.plan, price = planPrice(p);
    const label = act ? (act.planId === p.id ? 'Gia hạn gói này' : 'Đổi sang gói này') : 'Đăng ký gói này';
    return `<article class="plan ${p.featured || promo ? 'featured' : ''}" style="--c:${plateVar(p.color)}">
      ${promo ? `<span class="plan-badge">-${PROMO.percent}% khai trương</span>` : p.featured ? `<span class="plan-badge" style="background:var(--c);color:#fff">Phổ biến nhất</span>` : ''}
      <div class="plate"><span>${esc(p.weight)}</span></div>
      <div><h3 class="plan-name">${esc(p.name)}</h3><div class="plan-dur">${p.months} tháng · chỉ ${vnd(Math.round(price / p.months / 1000) * 1000)}/tháng</div></div>
      <div class="price">${promo ? `<s>${vnd(p.price)}</s>` : ''}<b>${shortPrice(price)}</b><small>/ ${p.months} tháng</small></div>
      <ul class="perks">${p.perks.map(x => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
      <button class="btn ${p.featured || promo ? 'btn-primary' : 'btn-dark'} btn-block" data-action="choose-plan" data-id="${p.id}">${act && act.planId === p.id ? '✓ ' : ''}${label}</button>
    </article>`;
  }).join('');
}

function renderSchedule() {
  const ti = dayIndex(today()), monday = addDays(today(), 1 - ti);
  $('#scheduleGrid').innerHTML = [1, 2, 3, 4, 5, 6, 7].map(d => {
    const date = addDays(monday, d - 1);
    const items = CLASSES.filter(c => c[1] === d).sort((a, b) => a[2].localeCompare(b[2]));
    return `<div class="sch-day ${d === ti ? 'today' : ''}">
      <div class="sch-head">${DOW[date.getDay()]} <small>${d === ti ? 'Hôm nay · ' : ''}${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}</small></div>
      <div class="sch-body">${items.map(c => `<div class="sch-cls" style="--c:${plateVar(c[5])}"><time>${c[2]} · ${c[3]} phút</time><b>${esc(c[0])}</b><span>HLV ${esc(c[4])}</span></div>`).join('')}</div>
    </div>`;
  }).join('');
}

function renderContact() {
  $('#contactCard').innerHTML = `
    <div class="contact-item"><span class="ci-icon">${icon('phone')}</span><div><small>Hotline hỗ trợ</small><div class="hotline">${GYM.hotline}</div>
      <div class="contact-actions"><a class="btn btn-primary btn-sm" href="tel:${GYM.hotlineTel}">${icon('phone')}Gọi ngay</a><button class="btn btn-sm" data-action="copy" data-text="${GYM.hotlineTel}">${icon('copy')}Sao chép số</button></div></div></div>
    <div class="contact-item"><span class="ci-icon">${icon('pin')}</span><div><small>Địa chỉ</small><b>${esc(GYM.address)}</b>
      <div class="contact-actions"><a class="btn btn-sm" href="${GYM.mapUrl}" target="_blank" rel="noopener">${icon('map')}Chỉ đường Google Maps</a></div></div></div>
    <div class="contact-item"><span class="ci-icon">${icon('mail')}</span><div><small>Email</small><b>${GYM.email}</b></div></div>
    <div class="contact-item"><span class="ci-icon">${icon('clock')}</span><div><small>Giờ mở cửa</small><div class="hours">${GYM.hours.map(h => `<span>${h[0]}</span><span>${h[1]}</span>`).join('')}</div></div></div>
    <div class="contact-item"><span class="ci-icon">${icon('chat')}</span><div><small>Nhắn tin trực tiếp</small><b>Quản lý trả lời trong giờ mở cửa</b>
      <div class="contact-actions"><button class="btn btn-sm" data-action="open-chat">${icon('chat')}Nhắn tin với quản lý</button></div></div></div>`;
  $('#footerContact').innerHTML = `<li>${esc(GYM.address)}</li><li>Hotline: <span class="num">${GYM.hotline}</span></li><li>${GYM.email}</li><li>${GYM.hours[0][0]}: ${GYM.hours[0][1]}</li>`;
}

/* ---------- 7. ĐĂNG NHẬP / ĐĂNG KÝ ---------- */
const bigPlateSVG = `<img class="auth-photo" src="images/gym-3.jpg" alt=""><svg class="big-plate spin" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="190" fill="var(--plate-red)"/><circle cx="200" cy="200" r="180" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><circle cx="200" cy="200" r="120" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><circle cx="200" cy="200" r="56" fill="rgba(0,0,0,.18)"/><circle cx="200" cy="200" r="28" fill="var(--band)" stroke="#9aa3ad" stroke-width="6"/></svg>`;
const pwField = (id, name, label, extra = '') => `<div class="field"><label for="${id}">${label}</label><div class="pw-wrap"><input type="password" id="${id}" name="${name}" ${extra}><button type="button" data-action="toggle-pw" data-for="${id}" aria-label="Hiện/ẩn mật khẩu">${icon('eye')}</button></div><span class="err"></span></div>`;

function authNotice() {
  if (afterAuth?.plan) return `<div class="notice">${icon('alert')}<div><b>Sắp xong rồi!</b><p>Đăng nhập hoặc tạo tài khoản để hoàn tất đăng ký gói ${esc(planById(afterAuth.plan)?.name || '')}.</p></div></div>`;
  if (afterAuth?.trial) return `<div class="notice">${icon('alert')}<div><b>Nhận 3 ngày tập thử miễn phí</b><p>Tạo tài khoản, vé tập thử sẽ được kích hoạt ngay.</p></div></div>`;
  return '';
}

function renderLogin() {
  $('#view-login').innerHTML = `<div class="auth">
    <div class="auth-art">${bigPlateSVG}<h2>Chào mừng<br><em>trở lại</em></h2><p>Đăng nhập để xem gói đã đăng ký, đổi gói và nhắn tin với quản lý.</p></div>
    <div class="auth-panel"><div class="auth-box">
      <h1>Đăng nhập</h1><p>Dùng email hoặc số điện thoại đã đăng ký.</p>
      ${authNotice()}
      <form class="form" id="loginForm" novalidate>
        <div class="field"><label for="lg-id">Email hoặc số điện thoại</label><input id="lg-id" name="identity" autocomplete="username" placeholder="ban@email.com"><span class="err"></span></div>
        ${pwField('lg-pass', 'password', 'Mật khẩu', 'autocomplete="current-password" placeholder="••••••"')}
        <button class="btn btn-primary btn-lg btn-block" type="submit">Đăng nhập</button>
      </form>
      <div class="demo-box"><b>Tài khoản dùng thử</b>
        <div class="demo-row"><span>Hội viên: <code>member@gangthep.vn</code> / <code>123456</code></span><button class="btn btn-sm" data-action="demo-fill" data-u="member@gangthep.vn" data-p="123456">Điền</button></div>
        <div class="demo-row"><span>Quản lý: <code>admin@gangthep.vn</code> / <code>admin123</code></span><button class="btn btn-sm" data-action="demo-fill" data-u="admin@gangthep.vn" data-p="admin123">Điền</button></div>
      </div>
      <div class="auth-switch">Chưa có tài khoản? <a class="link" href="#register">Đăng ký miễn phí</a></div>
    </div></div></div>`;
}

function renderRegister() {
  $('#view-register').innerHTML = `<div class="auth">
    <div class="auth-art">${bigPlateSVG}<h2>Buổi tập đầu tiên<br><em>bắt đầu từ đây</em></h2><p>Tạo tài khoản để đăng ký gói online, nhận 3 ngày tập thử và 1 lần đo InBody miễn phí.</p></div>
    <div class="auth-panel"><div class="auth-box">
      <h1>Tạo tài khoản</h1><p>Chỉ mất chưa đến 1 phút.</p>
      ${authNotice()}
      <form class="form" id="registerForm" novalidate>
        <div class="field"><label for="rg-name">Họ và tên</label><input id="rg-name" name="name" autocomplete="name" placeholder="Nguyễn Văn A"><span class="err"></span></div>
        <div class="field"><label for="rg-email">Email</label><input id="rg-email" name="email" type="email" autocomplete="email" placeholder="ban@email.com"><span class="err"></span></div>
        <div class="field"><label for="rg-phone">Số điện thoại</label><input id="rg-phone" name="phone" inputmode="numeric" autocomplete="tel" placeholder="09xx xxx xxx"><span class="err"></span></div>
        ${pwField('rg-pass', 'password', 'Mật khẩu (tối thiểu 6 ký tự)', 'autocomplete="new-password"')}
        <div class="strength" id="pwStrength" data-s="0" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        ${pwField('rg-pass2', 'password2', 'Nhập lại mật khẩu', 'autocomplete="new-password"')}
        <div class="field"><label class="check"><input type="checkbox" id="rg-agree" name="agree"> <span>Tôi đồng ý với nội quy phòng tập và chính sách bảo mật thông tin của Gang Thép Gym.</span></label><span class="err"></span></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Tạo tài khoản</button>
      </form>
      <div class="auth-switch">Đã có tài khoản? <a class="link" href="#login">Đăng nhập</a></div>
    </div></div></div>`;
}

function setErr(form, name, msg) {
  const input = form.querySelector(`[name="${name}"]`); if (!input) return;
  const f = input.closest('.field'); f.classList.add('invalid'); f.querySelector('.err').textContent = msg;
}
function clearErr(form) { $$('.field', form).forEach(f => { f.classList.remove('invalid'); const e = f.querySelector('.err'); if (e) e.textContent = ''; }); }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^0\d{9}$/;

async function handleLogin(form) {
  clearErr(form);
  const d = Object.fromEntries(new FormData(form));
  const idt = d.identity.trim().toLowerCase().replace(/\s/g, '');
  if (!idt) return setErr(form, 'identity', 'Nhập email hoặc số điện thoại.');
  if (!d.password) return setErr(form, 'password', 'Nhập mật khẩu.');
  const u = db.users.find(x => x.email.toLowerCase() === idt || x.phone === idt);
  if (!u) return setErr(form, 'identity', 'Không tìm thấy tài khoản với thông tin này.');
  if (u.pass !== await hashPassword(d.password)) return setErr(form, 'password', 'Mật khẩu chưa đúng. Kiểm tra lại phím Caps Lock.');
  lsSet(SESSION_KEY, u.id);
  toast(u.role === 'admin' ? 'Xin chào, quản lý!' : `Xin chào, ${firstName(u.name)}!`, true);
  finishAuth(u);
}

async function handleRegister(form) {
  clearErr(form);
  const d = Object.fromEntries(new FormData(form));
  const name = d.name.trim().replace(/\s+/g, ' '), email = d.email.trim().toLowerCase(), phone = d.phone.replace(/\s/g, '');
  let ok = true;
  const bad = (n, m) => { setErr(form, n, m); ok = false; };
  if (name.length < 4 || !name.includes(' ')) bad('name', 'Nhập đầy đủ họ và tên.');
  if (!EMAIL_RE.test(email)) bad('email', 'Email chưa đúng định dạng, ví dụ: ten@gmail.com');
  else if (db.users.some(u => u.email.toLowerCase() === email)) bad('email', 'Email này đã được đăng ký. Hãy đăng nhập.');
  if (!PHONE_RE.test(phone)) bad('phone', 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.');
  else if (db.users.some(u => u.phone === phone)) bad('phone', 'Số điện thoại này đã được đăng ký.');
  if ((d.password || '').length < 6) bad('password', 'Mật khẩu cần ít nhất 6 ký tự.');
  if (d.password !== d.password2) bad('password2', 'Hai mật khẩu chưa khớp nhau.');
  if (!d.agree) bad('agree', 'Bạn cần đồng ý với nội quy để tiếp tục.');
  if (!ok) return;
  db.seq += 1;
  const u = { id: uid('u'), code: 'GT' + String(db.seq).padStart(4, '0'), name, email, phone, role: 'member', pass: await hashPassword(d.password), createdAt: Date.now() };
  db.users.push(u);
  db.messages.push({ id: uid('m'), userId: u.id, from: 'admin', text: `Chào mừng ${firstName(name)} đến với Gang Thép Gym! Mã hội viên của bạn là ${u.code}. Có thắc mắc gì cứ nhắn ở đây nhé.`, at: Date.now(), readByAdmin: true, readByUser: false, auto: true });
  save();
  lsSet(SESSION_KEY, u.id);
  toast(`Tạo tài khoản thành công. Mã hội viên: ${u.code}`, true);
  finishAuth(u);
}

function finishAuth(u) {
  const next = afterAuth; afterAuth = null;
  if (u.role === 'admin') return go('admin');
  go('account');
  if (next?.plan) setTimeout(() => choosePlan(next.plan), 300);
  else if (next?.trial) setTimeout(startTrial, 300);
}

function logout() {
  lsSet(SESSION_KEY, '');
  ui.chatOpen = false;
  toast('Bạn đã đăng xuất.');
  go('home');
}

/* ---------- 8. TRANG TÀI KHOẢN HỘI VIÊN ---------- */
function renderAccount() {
  const u = me(); if (!u) return;
  const act = activeSub(u.id), pend = pendingSub(u.id);
  const hist = db.subs.filter(s => s.userId === u.id).sort((a, b) => b.createdAt - a.createdAt);
  const usedTrial = hist.some(s => s.kind === 'trial');
  let current;
  if (act) {
    const p = planById(act.planId), left = daysLeft(act), pct = Math.max(0, Math.min(100, left / totalDays(act) * 100));
    const color = left <= 7 ? 'var(--warn)' : 'var(--ok)';
    current = `<div class="current-plan">
      <div class="plate" style="--c:${plateVar(p.color)}"><span>${esc(p.weight)}</span></div>
      <div style="min-width:0">${pill('active')}
        <h3 style="margin-top:8px">${esc(p.name)}</h3>
        <div class="cp-dates"><div>Bắt đầu<b class="num">${fmtDate(act.start)}</b></div><div>Hết hạn<b class="num">${fmtDate(act.end)}</b></div><div>Đã thanh toán<b class="num">${vnd(act.amount)}</b></div></div>
        <div class="progress" style="--c:${color}"><i style="width:${pct}%"></i></div>
        <div class="progress-label"><span>Còn <b class="num" style="color:var(--ink)">${left}</b> ngày${left <= 7 ? ' · sắp hết hạn, nên gia hạn sớm' : ''}</span><span class="num">${Math.round(pct)}%</span></div>
        <div class="cp-actions">
          <button class="btn btn-primary" data-action="change-plan" ${pend ? 'disabled' : ''}>Đổi sang gói khác</button>
          ${act.planId !== 'trial' ? `<button class="btn" data-action="renew" ${pend ? 'disabled' : ''}>Gia hạn</button>` : ''}
          <button class="btn btn-ghost" data-action="cancel-sub" data-id="${act.id}">Hủy gói</button>
        </div>
        ${pend ? '<p class="mono" style="color:var(--muted);margin:10px 0 0">Đang có yêu cầu chờ xác nhận nên tạm khóa đổi gói/gia hạn.</p>' : ''}
      </div></div>`;
  } else {
    current = `<div class="empty"><b>Bạn chưa có gói tập nào đang hoạt động</b><span>Chọn một gói trong bảng giá, hoặc nhận 3 ngày tập thử miễn phí nếu bạn là thành viên mới.</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn btn-primary" data-scroll="plans">Xem bảng giá</button>${!usedTrial && !pend ? '<button class="btn" data-action="start-trial">Nhận 3 ngày tập thử</button>' : ''}</div></div>`;
  }
  $('#view-account').innerHTML = `
  <section class="page-band"><div class="wrap page-band-inner">
    <div><span class="eyebrow">Mã hội viên ${u.code}</span><h1>Xin chào, ${esc(firstName(u.name))}</h1><p>Thành viên từ ${fmtDate(u.createdAt)} · ${esc(u.email)}</p></div>
    <div class="actions"><button class="btn" data-action="open-chat">${icon('chat')}Nhắn tin quản lý</button><button class="btn" data-action="logout">${icon('logout')}Đăng xuất</button></div>
  </div></section>
  <div class="wrap page-body">
    ${pend ? `<div class="notice">${icon('clock')}<div><b>${KIND_LABEL[pend.kind]}: ${esc(planById(pend.planId).name)} đang chờ xác nhận</b>
      <p>Cần thanh toán <b class="num" style="display:inline">${vnd(pend.amount)}</b> · ${methodName(pend.method)}. Quản lý sẽ kích hoạt ngay khi nhận được thanh toán.</p></div>
      <button class="btn btn-sm" data-action="cancel-request" data-id="${pend.id}">Hủy yêu cầu</button></div>` : ''}
    <div class="grid-2">
      <div class="stack">
        <section class="panel"><div class="panel-head"><h2>Gói đang sử dụng</h2></div><div class="panel-body">${current}</div></section>
        <section class="panel"><div class="panel-head"><h2>Các gói đã đăng ký</h2><span class="meta">${hist.length} giao dịch</span></div>
          <div class="panel-body" style="padding-inline:0;padding-bottom:4px">${hist.length ? `<div class="table-wrap"><table>
            <thead><tr><th>Gói</th><th>Loại</th><th>Thời hạn</th><th>Số tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>${hist.map(s => `<tr><td>${planTag(planById(s.planId))}</td><td>${KIND_LABEL[s.kind]}</td>
              <td class="num">${s.status === 'pending' ? 'Chờ kích hoạt' : `${fmtDate(s.start)} – ${fmtDate(s.end)}`}</td>
              <td class="num">${vnd(s.amount)}</td><td>${pill(subState(s))}</td></tr>`).join('')}</tbody></table></div>`
            : '<div class="empty">Chưa có giao dịch nào.</div>'}</div></section>
      </div>
      <div class="stack">
        <section class="panel"><div class="panel-head"><h2>Thông tin cá nhân</h2></div><div class="panel-body">
          <form class="form" id="profileForm" novalidate style="grid-template-columns:1fr">
            <div class="field"><label for="pf-name">Họ và tên</label><input id="pf-name" name="name" value="${esc(u.name)}"><span class="err"></span></div>
            <div class="field"><label for="pf-phone">Số điện thoại</label><input id="pf-phone" name="phone" value="${esc(u.phone)}" inputmode="numeric"><span class="err"></span></div>
            <div class="field"><label for="pf-email">Email (không đổi được)</label><input id="pf-email" value="${esc(u.email)}" disabled></div>
            <button class="btn btn-dark" type="submit">Lưu thông tin</button>
          </form></div></section>
        <section class="panel"><div class="panel-head"><h2>Đổi mật khẩu</h2></div><div class="panel-body">
          <form class="form" id="passwordForm" novalidate style="grid-template-columns:1fr">
            ${pwField('pw-old', 'old', 'Mật khẩu hiện tại')}${pwField('pw-new', 'password', 'Mật khẩu mới')}${pwField('pw-new2', 'password2', 'Nhập lại mật khẩu mới')}
            <button class="btn" type="submit">Cập nhật mật khẩu</button>
          </form></div></section>
        <section class="panel"><div class="panel-body" style="display:flex;gap:14px;align-items:center">
          <span class="avatar lg" style="--c:var(--accent)">${icon('phone')}</span>
          <div><b>Cần hỗ trợ gấp?</b><div class="num" style="font-family:var(--font-display);font-size:26px;font-weight:800">${GYM.hotline}</div><span style="color:var(--muted);font-size:13px">${GYM.hours[0][0]}, ${GYM.hours[0][1]}</span></div>
        </div></section>
      </div>
    </div>
  </div>`;
}

async function handleProfile(form) {
  clearErr(form);
  const u = me(), d = Object.fromEntries(new FormData(form));
  const name = d.name.trim().replace(/\s+/g, ' '), phone = d.phone.replace(/\s/g, '');
  let ok = true;
  if (name.length < 4 || !name.includes(' ')) { setErr(form, 'name', 'Nhập đầy đủ họ và tên.'); ok = false; }
  if (!PHONE_RE.test(phone)) { setErr(form, 'phone', 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.'); ok = false; }
  else if (db.users.some(x => x.phone === phone && x.id !== u.id)) { setErr(form, 'phone', 'Số này đã thuộc tài khoản khác.'); ok = false; }
  if (!ok) return;
  Object.assign(u, { name, phone }); save(); renderAccount(); renderHeader(); toast('Đã lưu thông tin cá nhân.', true);
}
async function handlePassword(form) {
  clearErr(form);
  const u = me(), d = Object.fromEntries(new FormData(form));
  if (u.pass !== await hashPassword(d.old)) return setErr(form, 'old', 'Mật khẩu hiện tại chưa đúng.');
  if ((d.password || '').length < 6) return setErr(form, 'password', 'Mật khẩu mới cần ít nhất 6 ký tự.');
  if (d.password !== d.password2) return setErr(form, 'password2', 'Hai mật khẩu chưa khớp nhau.');
  u.pass = await hashPassword(d.password); save(); form.reset(); toast('Đã đổi mật khẩu.', true);
}

/* --- Luồng chọn gói --- */
function choosePlan(planId) {
  const u = me(), p = planById(planId);
  if (!u) { afterAuth = { plan: planId }; toast('Tạo tài khoản hoặc đăng nhập để đăng ký gói.'); return go('register'); }
  if (u.role === 'admin') return toast('Tài khoản quản lý không đăng ký gói tập.');
  if (pendingSub(u.id)) { toast('Bạn đang có một yêu cầu chờ xác nhận.'); return go('account'); }
  const act = activeSub(u.id);
  if (!act) return subscribeModal(p);
  if (act.planId === planId) return renewModal(act);
  changeModal(act, planId);
}

const methodOptions = (sel = 'counter') => `<div class="field"><span class="field-label">Phương thức thanh toán</span><div class="options">${METHODS.map(m =>
  `<label class="option"><input type="radio" name="method" value="${m[0]}" ${m[0] === sel ? 'checked' : ''}><span class="opt-main"><b>${m[1]}</b><small>${m[2]}</small></span></label>`).join('')}</div></div>`;
const planHead = p => `<div class="list-row" style="padding:0;border:0"><div class="plate sm" style="--c:${plateVar(p.color)}"><span>${esc(p.weight)}</span></div>
  <div class="main"><b style="font-size:17px">${esc(p.name)}</b><span>${p.months ? p.months + ' tháng' : p.days + ' ngày'}${p.perks[0] ? ' · ' + esc(p.perks.slice(0, 2).join(', ')) : ''}</span></div></div>`;

function subscribeModal(p) {
  const u = me(), price = planPrice(p), promo = price !== p.price;
  modal({
    title: 'Đăng ký gói',
    submit: 'Gửi yêu cầu đăng ký',
    body: `${planHead(p)}
      <div class="field"><label for="m-start">Ngày bắt đầu tập</label><input type="date" id="m-start" name="start" min="${iso(today())}" value="${iso(today())}"><span class="err"></span></div>
      ${methodOptions()}
      <div class="summary"><div><span>Giá gói</span><b class="num">${vnd(p.price)}</b></div>
        ${promo ? `<div><span>Ưu đãi khai trương -${PROMO.percent}%</span><b class="num" style="color:var(--ok)">-${vnd(p.price - price)}</b></div>` : ''}
        <div class="total"><span>Cần thanh toán</span><b class="num">${vnd(price)}</b></div></div>`,
    onSubmit(d, form) {
      if (!d.start || parse(d.start) < today()) { setErr(form, 'start', 'Chọn ngày từ hôm nay trở đi.'); return false; }
      const start = parse(d.start);
      db.subs.push({ id: uid('s'), userId: u.id, planId: p.id, kind: 'new', status: 'pending', start: d.start, end: iso(addMonths(start, p.months)), value: price, amount: price, method: d.method, createdAt: Date.now(), confirmedAt: null });
      save(); afterChange('Đã gửi yêu cầu đăng ký. Quản lý sẽ xác nhận khi nhận được thanh toán.');
    }
  });
}

function changeModal(act, targetId) {
  const cur = planById(act.planId), credit = creditOf(act);
  const choices = db.plans.filter(p => p.id !== act.planId);
  const sel = targetId && targetId !== act.planId ? targetId : choices[0].id;
  modal({
    title: 'Đổi gói tập',
    submit: 'Gửi yêu cầu đổi gói',
    body: `<p>Gói hiện tại: <b style="color:var(--ink)">${esc(cur.name)}</b>, còn ${daysLeft(act)} ngày. Giá trị còn lại được trừ vào gói mới, gói mới bắt đầu tính từ ngày quản lý xác nhận.</p>
      <div class="field"><span class="field-label">Chọn gói mới</span><div class="options">${choices.map(p => `<label class="option"><input type="radio" name="plan" value="${p.id}" ${p.id === sel ? 'checked' : ''}>
        <span class="plate-dot" style="--c:${plateVar(p.color)}"></span><span class="opt-main"><b>${esc(p.name)}</b><small>${p.months} tháng</small></span><b class="num">${vnd(planPrice(p))}</b></label>`).join('')}</div></div>
      ${methodOptions()}
      <div class="summary" id="changeSummary"></div>`,
    onOpen(form) {
      const update = () => {
        const p = planById(form.plan.value), price = planPrice(p), due = Math.max(0, price - credit);
        $('#changeSummary').innerHTML = `<div><span>Giá gói ${esc(p.name)}</span><b class="num">${vnd(price)}</b></div>
          <div><span>Trừ giá trị còn lại của ${esc(cur.name)}</span><b class="num" style="color:var(--ok)">-${vnd(Math.min(credit, price))}</b></div>
          <div class="total"><span>Cần thanh toán thêm</span><b class="num">${vnd(due)}</b></div>
          ${credit > price ? '<div><span style="font-size:12px">Gói mới rẻ hơn phần còn lại nên không phải trả thêm. Phần chênh lệch không được hoàn tiền.</span></div>' : ''}`;
      };
      form.addEventListener('change', update); update();
    },
    onSubmit(d) {
      const p = planById(d.plan), price = planPrice(p);
      db.subs.push({ id: uid('s'), userId: act.userId, planId: p.id, kind: 'change', status: 'pending', replaces: act.id, start: iso(today()), end: iso(addMonths(today(), p.months)), value: price, amount: Math.max(0, price - credit), method: d.method, createdAt: Date.now(), confirmedAt: null });
      save(); afterChange(`Đã gửi yêu cầu đổi sang ${p.name}.`);
    }
  });
}

function renewModal(act) {
  const p = planById(act.planId), price = planPrice(p), newEnd = iso(addMonths(parse(act.end), p.months));
  modal({
    title: 'Gia hạn gói',
    submit: 'Gửi yêu cầu gia hạn',
    body: `${planHead(p)}${methodOptions()}
      <div class="summary"><div><span>Hạn hiện tại</span><b class="num">${fmtDate(act.end)}</b></div><div><span>Hạn mới sau khi gia hạn</span><b class="num">${fmtDate(newEnd)}</b></div>
      <div class="total"><span>Cần thanh toán</span><b class="num">${vnd(price)}</b></div></div>`,
    onSubmit(d) {
      db.subs.push({ id: uid('s'), userId: act.userId, planId: p.id, kind: 'renew', status: 'pending', target: act.id, start: act.end, end: newEnd, value: price, amount: price, method: d.method, createdAt: Date.now(), confirmedAt: null });
      save(); afterChange('Đã gửi yêu cầu gia hạn.');
    }
  });
}

function startTrial() {
  const u = me();
  if (!u) { afterAuth = { trial: true }; return go('register'); }
  if (u.role === 'admin') return toast('Tài khoản quản lý không cần tập thử.');
  if (db.subs.some(s => s.userId === u.id)) { toast('Vé tập thử chỉ dành cho thành viên chưa từng đăng ký gói.'); return go('account'); }
  modal({
    title: 'Nhận vé tập thử',
    submit: 'Kích hoạt ngay',
    body: `${planHead(TRIAL)}<p>Vé có hiệu lực 3 ngày kể từ hôm nay, dùng được toàn bộ khu tập và lớp nhóm. Mang theo giày sạch và khăn tập khi đến nhé.</p>
      <div class="summary"><div><span>Hiệu lực</span><b class="num">${fmtDate(iso(today()))} – ${fmtDate(iso(addDays(today(), 3)))}</b></div><div class="total"><span>Chi phí</span><b>Miễn phí</b></div></div>`,
    onSubmit() {
      db.subs.push({ id: uid('s'), userId: u.id, planId: 'trial', kind: 'trial', status: 'active', start: iso(today()), end: iso(addDays(today(), 3)), value: 0, amount: 0, method: 'free', createdAt: Date.now(), confirmedAt: Date.now() });
      systemMessage(u.id, 'Vé tập thử 3 ngày của bạn đã được kích hoạt. Khi đến quầy, chỉ cần đọc mã hội viên cho lễ tân.');
      save(); afterChange('Đã kích hoạt vé tập thử 3 ngày!');
    }
  });
}

function afterChange(msg) {
  toast(msg, true);
  if (view === 'account') renderAccount(); else go('account');
  renderPlans(); renderChat();
}

/* ---------- 9. TRANG QUẢN TRỊ ---------- */
const members = () => db.users.filter(u => u.role === 'member');
const pendingList = () => db.subs.filter(s => s.status === 'pending').sort((a, b) => a.createdAt - b.createdAt);
const unreadAdmin = () => db.messages.filter(m => m.from === 'user' && !m.readByAdmin).length;
function monthRevenue(offset = 0) {
  const t = today(), from = new Date(t.getFullYear(), t.getMonth() + offset, 1), to = new Date(t.getFullYear(), t.getMonth() + offset + 1, 1);
  return db.subs.filter(s => s.confirmedAt && s.confirmedAt >= +from && s.confirmedAt < +to && s.status !== 'rejected').reduce((a, s) => a + (s.amount || 0), 0);
}

function renderAdmin() {
  const pend = pendingList(), unread = unreadAdmin(), newContacts = db.contacts.filter(c => !c.done).length;
  const tabs = [['overview', 'Tổng quan', 0], ['requests', 'Yêu cầu chờ duyệt', pend.length], ['members', 'Hội viên', 0], ['inbox', 'Tin nhắn', unread], ['contacts', 'Liên hệ', newContacts], ['plans', 'Gói tập', 0]];
  const body = { overview: adminOverview, requests: adminRequests, members: adminMembers, inbox: adminInbox, contacts: adminContacts, plans: adminPlans }[ui.adminTab]();
  const draft = $('#adminMsg')?.value || '';
  $('#view-admin').innerHTML = `
  <section class="page-band"><div class="wrap page-band-inner">
    <div><span class="eyebrow">Khu vực quản lý</span><h1>Bảng điều khiển</h1><p>${['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][today().getDay()]}, ${fmtDate(iso(today()))} · Cơ sở Cầu Giấy</p></div>
    <div class="actions"><button class="btn" data-go="home">Xem trang chủ</button><button class="btn" data-action="logout">${icon('logout')}Đăng xuất</button></div>
  </div></section>
  <div class="wrap page-body">
    <div class="tabs" role="tablist">${tabs.map(([k, l, n]) => `<button class="tab" role="tab" aria-selected="${ui.adminTab === k}" data-action="admin-tab" data-tab="${k}">${l}${n ? `<span class="count">${n}</span>` : ''}</button>`).join('')}</div>
    ${body}
  </div>`;
  const msgInput = $('#adminMsg'); if (msgInput && draft) msgInput.value = draft;
  const box = $('#adminThread'); if (box) box.scrollTop = box.scrollHeight;
}

function requestRows(list) {
  return list.map(s => {
    const u = userById(s.userId), p = planById(s.planId); if (!u || !p) return '';
    return `<tr><td><div class="cell-user">${avatar(u)}<div><b>${esc(u.name)}</b><span>${u.code} · ${esc(u.phone)}</span></div></div></td>
      <td>${KIND_LABEL[s.kind]}${s.kind === 'change' ? `<br><span style="font-size:12px;color:var(--muted)">từ ${esc(planById(db.subs.find(x => x.id === s.replaces)?.planId)?.name || '—')}</span>` : ''}</td>
      <td>${planTag(p)}</td><td class="num"><b>${vnd(s.amount)}</b></td><td>${methodName(s.method)}</td>
      <td class="num" style="color:var(--muted)">${fmtDate(s.createdAt)} ${fmtTime(s.createdAt)}</td>
      <td><div class="row-actions"><button class="btn btn-sm btn-primary" data-action="confirm-req" data-id="${s.id}">${icon('check')}Xác nhận</button><button class="btn btn-sm" data-action="reject-req" data-id="${s.id}">Từ chối</button></div></td></tr>`;
  }).join('');
}

function adminOverview() {
  const ms = members(), activeCount = ms.filter(u => activeSub(u.id)).length, pend = pendingList();
  const cur = monthRevenue(0), prev = monthRevenue(-1), delta = prev ? Math.round((cur - prev) / prev * 100) : null;
  const mix = db.plans.map(p => ({ p, n: ms.filter(u => activeSub(u.id)?.planId === p.id).length }));
  const expiring = ms.map(u => ({ u, s: activeSub(u.id) })).filter(x => x.s && daysLeft(x.s) <= 7).sort((a, b) => daysLeft(a.s) - daysLeft(b.s));
  return `
  <section class="kpis">
    <div class="panel kpi"><small>Hội viên</small><b>${ms.length}</b><span>${ms.filter(u => u.createdAt >= +new Date(today().getFullYear(), today().getMonth(), 1)).length} đăng ký tháng này</span></div>
    <div class="panel kpi"><small>Đang có gói</small><b>${activeCount}</b><span>${ms.length - activeCount} chưa có gói hoạt động</span></div>
    <div class="panel kpi ${pend.length ? 'alert' : ''}"><small>Chờ duyệt</small><b>${pend.length}</b><span>Yêu cầu cần xác nhận thanh toán</span></div>
    <div class="panel kpi"><small>Doanh thu tháng</small><b>${(cur / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}<span style="font-size:16px"> tr</span></b><span>${delta === null ? 'Tháng trước chưa có dữ liệu' : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% so với tháng trước`}</span></div>
    <div class="panel kpi ${unreadAdmin() ? 'alert' : ''}"><small>Tin chưa đọc</small><b>${unreadAdmin()}</b><span>${db.contacts.filter(c => !c.done).length} lời nhắn liên hệ mới</span></div>
  </section>
  <div class="grid-2">
    <section class="panel"><div class="panel-head"><h2>Yêu cầu chờ duyệt</h2><button class="link" data-action="admin-tab" data-tab="requests">Xem tất cả</button></div>
      <div class="panel-body" style="padding-inline:0">${pend.length ? `<div class="table-wrap"><table><thead><tr><th>Hội viên</th><th>Loại</th><th>Gói</th><th>Số tiền</th><th>Thanh toán</th><th>Gửi lúc</th><th></th></tr></thead><tbody>${requestRows(pend.slice(0, 4))}</tbody></table></div>` : '<div class="empty">Không có yêu cầu nào đang chờ.</div>'}</div></section>
    <div class="stack">
      <section class="panel"><div class="panel-head"><h2>Cơ cấu gói đang hoạt động</h2></div><div class="panel-body">
        <div class="mix-bar">${mix.filter(x => x.n).map(x => `<span style="--c:${plateVar(x.p.color)};flex:${x.n}" title="${esc(x.p.name)}: ${x.n}"></span>`).join('')}</div>
        <div class="mix-legend">${mix.map(x => `<div><span class="plate-dot" style="--c:${plateVar(x.p.color)}"></span>${esc(x.p.name)}<b>${x.n}</b></div>`).join('')}</div></div></section>
      <section class="panel"><div class="panel-head"><h2>Sắp hết hạn (7 ngày)</h2></div><div class="panel-body list">
        ${expiring.length ? expiring.map(x => `<div class="list-row">${avatar(x.u)}<div class="main"><b>${esc(x.u.name)}</b><span>${esc(planById(x.s.planId).name)} · còn ${daysLeft(x.s)} ngày</span></div><button class="btn btn-sm" data-action="admin-chat" data-id="${x.u.id}">Nhắn nhắc</button></div>`).join('') : '<span style="color:var(--muted)">Không có hội viên nào sắp hết hạn.</span>'}
      </div></section>
    </div>
  </div>`;
}

function adminRequests() {
  const pend = pendingList();
  const done = db.subs.filter(s => s.confirmedAt || s.status === 'rejected').filter(s => s.kind !== 'trial').sort((a, b) => (b.confirmedAt || b.rejectedAt || 0) - (a.confirmedAt || a.rejectedAt || 0)).slice(0, 8);
  return `<section class="panel"><div class="panel-head"><h2>Chờ xác nhận thanh toán</h2><span class="meta">Bấm "Xác nhận" sau khi đã nhận tiền để kích hoạt gói cho hội viên</span></div>
    <div class="panel-body" style="padding-inline:0">${pend.length ? `<div class="table-wrap"><table><thead><tr><th>Hội viên</th><th>Loại</th><th>Gói</th><th>Số tiền</th><th>Thanh toán</th><th>Gửi lúc</th><th></th></tr></thead><tbody>${requestRows(pend)}</tbody></table></div>` : '<div class="empty"><b>Đã xử lý hết</b><span>Yêu cầu mới từ hội viên sẽ hiện ở đây.</span></div>'}</div></section>
  <section class="panel"><div class="panel-head"><h2>Đã xử lý gần đây</h2></div><div class="panel-body" style="padding-inline:0">
    ${done.length ? `<div class="table-wrap"><table><thead><tr><th>Hội viên</th><th>Loại</th><th>Gói</th><th>Số tiền</th><th>Trạng thái</th></tr></thead><tbody>${done.map(s => { const u = userById(s.userId); return u ? `<tr><td>${esc(u.name)}</td><td>${KIND_LABEL[s.kind]}</td><td>${planTag(planById(s.planId))}</td><td class="num">${vnd(s.amount)}</td><td>${pill(subState(s))}</td></tr>` : ''; }).join('')}</tbody></table></div>` : '<div class="empty">Chưa có.</div>'}
  </div></section>`;
}

function adminMembers() {
  const q = ui.memberQ.trim().toLowerCase();
  const list = members().filter(u => !q || u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q) || u.code.toLowerCase().includes(q)).sort((a, b) => b.createdAt - a.createdAt);
  return `<div class="toolbar"><div class="search">${icon('search')}<input id="memberSearch" type="search" placeholder="Tìm theo tên, SĐT, email, mã" value="${esc(ui.memberQ)}" aria-label="Tìm hội viên"></div><span style="color:var(--muted);font-size:13px">${list.length} hội viên</span></div>
  <section class="panel"><div class="table-wrap">${list.length ? `<table><thead><tr><th>Hội viên</th><th>Liên hệ</th><th>Gói hiện tại</th><th>Hết hạn</th><th>Trạng thái</th><th>Tham gia</th><th></th></tr></thead><tbody>
    ${list.map(u => { const s = activeSub(u.id), last = db.subs.filter(x => x.userId === u.id && x.status !== 'pending').sort((a, b) => b.createdAt - a.createdAt)[0], st = s ? 'active' : pendingSub(u.id) ? 'pending' : last ? subState(last) : null;
      return `<tr><td><div class="cell-user">${avatar(u)}<div><b>${esc(u.name)}</b><span class="mono">${u.code}</span></div></div></td>
        <td><div style="font-size:13px">${esc(u.email)}<br><span class="num" style="color:var(--muted)">${esc(u.phone)}</span></div></td>
        <td>${s ? planTag(planById(s.planId)) : '<span style="color:var(--muted)">Chưa có</span>'}</td>
        <td class="num">${s ? `${fmtDate(s.end)}<br><span style="font-size:12px;color:${daysLeft(s) <= 7 ? 'var(--warn)' : 'var(--muted)'}">còn ${daysLeft(s)} ngày</span>` : '—'}</td>
        <td>${st ? pill(st) : '<span style="color:var(--muted)">Mới đăng ký</span>'}</td>
        <td class="num" style="color:var(--muted)">${fmtDate(u.createdAt)}</td>
        <td><div class="row-actions"><button class="btn btn-sm btn-icon" data-action="admin-chat" data-id="${u.id}" title="Nhắn tin" aria-label="Nhắn tin cho ${esc(u.name)}">${icon('chat')}</button><button class="btn btn-sm btn-icon" data-action="delete-user" data-id="${u.id}" title="Xoá" aria-label="Xoá ${esc(u.name)}">${icon('trash')}</button></div></td></tr>`; }).join('')}
  </tbody></table>` : '<div class="empty">Không tìm thấy hội viên phù hợp.</div>'}</div></section>`;
}

function conversations() {
  const map = {};
  db.messages.forEach(m => { (map[m.userId] = map[m.userId] || []).push(m); });
  return Object.entries(map).map(([id, msgs]) => ({ u: userById(id), msgs: msgs.sort((a, b) => a.at - b.at) }))
    .filter(c => c.u).sort((a, b) => b.msgs[b.msgs.length - 1].at - a.msgs[a.msgs.length - 1].at);
}

function adminInbox() {
  const convs = conversations();
  if (!ui.adminConv && convs.length) ui.adminConv = convs[0].u.id;
  const cur = convs.find(c => c.u.id === ui.adminConv) || (ui.adminConv && userById(ui.adminConv) ? { u: userById(ui.adminConv), msgs: [] } : null);
  if (cur) { let changed = false; cur.msgs.forEach(m => { if (m.from === 'user' && !m.readByAdmin) { m.readByAdmin = true; changed = true; } }); if (changed) save(); }
  const s = cur && activeSub(cur.u.id);
  return `<section class="panel inbox">
    <div class="inbox-list">${convs.length ? convs.map(c => { const last = c.msgs[c.msgs.length - 1], unread = c.msgs.filter(m => m.from === 'user' && !m.readByAdmin).length;
      return `<button class="conv" data-action="admin-conv" data-id="${c.u.id}" aria-current="${c.u.id === ui.adminConv}">${avatar(c.u)}<div class="main"><b>${esc(c.u.name)}</b><span>${last.from === 'admin' ? 'Bạn: ' : ''}${esc(last.text)}</span></div>${unread ? `<span class="unread">${unread}</span>` : `<small style="color:var(--muted);font-size:11px">${fmtTime(last.at)}</small>`}</button>`; }).join('') : '<div class="empty">Chưa có cuộc trò chuyện nào.</div>'}</div>
    <div class="thread">${cur ? `
      <div class="thread-head">${avatar(cur.u)}<div><b>${esc(cur.u.name)}</b><span>${cur.u.code} · ${esc(cur.u.phone)} · ${s ? esc(planById(s.planId).name) + ', còn ' + daysLeft(s) + ' ngày' : 'chưa có gói'}</span></div></div>
      <div class="msgs" id="adminThread">${renderMsgs(cur.msgs, 'admin')}</div>
      <form class="composer" id="adminComposer" autocomplete="off"><input id="adminMsg" name="text" placeholder="Trả lời ${esc(firstName(cur.u.name))}…" aria-label="Nội dung trả lời"><button class="btn btn-primary btn-icon" type="submit" aria-label="Gửi">${icon('send')}</button></form>`
      : '<div class="empty" style="margin:auto">Chọn một cuộc trò chuyện.</div>'}</div>
  </section>`;
}

function adminContacts() {
  const list = [...db.contacts].sort((a, b) => (a.done - b.done) || b.at - a.at);
  return `<section class="panel"><div class="panel-head"><h2>Lời nhắn từ form liên hệ</h2><span class="meta">Khách chưa có tài khoản gửi từ trang chủ</span></div><div class="panel-body list">
    ${list.length ? list.map(c => `<div class="list-row" style="${c.done ? 'opacity:.55' : ''}">
      <span class="avatar" style="--c:${c.done ? 'var(--off)' : 'var(--accent)'}">${esc(initials(c.name))}</span>
      <div class="main"><b>${esc(c.name)} · <span class="num">${esc(c.phone)}</span></b><span><b style="display:inline;color:var(--ink);font-weight:600">${esc(c.topic)}:</b> ${esc(c.message)}</span><span style="display:block;font-size:12px">${fmtDate(c.at)} ${fmtTime(c.at)}</span></div>
      <button class="btn btn-sm" data-action="toggle-contact" data-id="${c.id}">${c.done ? 'Mở lại' : icon('check') + 'Đã gọi lại'}</button>
    </div>`).join('') : '<div class="empty">Chưa có lời nhắn nào.</div>'}
  </div></section>`;
}

function adminPlans() {
  return `<p style="margin:0;color:var(--muted)">Giá thay đổi sẽ áp dụng ngay trên trang chủ cho các đăng ký mới. Gói đã kích hoạt giữ nguyên giá cũ.</p>
  <section class="panel"><div class="table-wrap"><table><thead><tr><th>Gói</th><th>Thời hạn</th><th>Giá niêm yết</th><th>Giá đang bán</th><th>Đang dùng</th><th></th></tr></thead><tbody>
    ${db.plans.map(p => `<tr><td>${planTag(p)}</td><td>${p.months} tháng</td><td class="num">${vnd(p.price)}</td><td class="num"><b>${vnd(planPrice(p))}</b>${planPrice(p) !== p.price ? ' <span class="pill pending">Khuyến mãi</span>' : ''}</td>
      <td class="num">${members().filter(u => activeSub(u.id)?.planId === p.id).length}</td><td><div class="row-actions"><button class="btn btn-sm" data-action="edit-plan" data-id="${p.id}">${icon('edit')}Sửa</button></div></td></tr>`).join('')}
  </tbody></table></div></section>`;
}

function editPlanModal(p) {
  modal({
    title: 'Sửa gói ' + esc(p.name), submit: 'Lưu gói',
    body: `<div class="form"><div class="field full"><label for="ep-name">Tên gói</label><input id="ep-name" name="name" value="${esc(p.name)}"><span class="err"></span></div>
      <div class="field"><label for="ep-months">Thời hạn (tháng)</label><input type="number" id="ep-months" name="months" value="${p.months}" min="1" max="36"><span class="err"></span></div>
      <div class="field"><label for="ep-price">Giá niêm yết (₫)</label><input type="number" id="ep-price" name="price" value="${p.price}" min="0" step="10000"><span class="err"></span></div>
      <div class="field full"><label for="ep-perks">Quyền lợi (mỗi dòng một ý)</label><textarea id="ep-perks" name="perks">${esc(p.perks.join('\n'))}</textarea></div></div>`,
    onSubmit(d, form) {
      if (!d.name.trim()) { setErr(form, 'name', 'Nhập tên gói.'); return false; }
      if (!(+d.months >= 1)) { setErr(form, 'months', 'Tối thiểu 1 tháng.'); return false; }
      if (!(+d.price > 0)) { setErr(form, 'price', 'Giá phải lớn hơn 0.'); return false; }
      Object.assign(p, { name: d.name.trim(), months: +d.months, price: +d.price, perks: d.perks.split('\n').map(s => s.trim()).filter(Boolean) });
      save(); renderAdmin(); renderPlans(); toast('Đã cập nhật gói tập.', true);
    }
  });
}

/* ---------- 10. CHAT VỚI QUẢN LÝ ---------- */
function renderMsgs(msgs, viewer) {
  let lastDay = '';
  return msgs.map(m => {
    const day = fmtDate(m.at), mine = viewer === 'admin' ? m.from === 'admin' : m.from === 'user';
    const sep = day !== lastDay ? `<span class="msg-day">${day === fmtDate(Date.now()) ? 'Hôm nay' : day}</span>` : '';
    lastDay = day;
    return `${sep}<div class="msg ${mine ? 'me' : 'them'} ${m.auto ? 'auto' : ''}">${esc(m.text)}<time>${fmtTime(m.at)}${m.auto ? ' · tự động' : ''}</time></div>`;
  }).join('') || '<span class="msg-day">Chưa có tin nhắn</span>';
}

function renderChat() {
  const u = me(), fab = $('#chatFab'), panel = $('#chatPanel');
  fab.hidden = view === 'admin';
  if (u?.role === 'admin') {
    const n = unreadAdmin();
    fab.innerHTML = `${icon('chat')}<span class="label">Hộp thư quản lý</span>${n ? `<span class="badge">${n}</span>` : ''}`;
    panel.hidden = true; return;
  }
  const unread = u ? db.messages.filter(m => m.userId === u.id && m.from === 'admin' && !m.readByUser).length : 0;
  fab.innerHTML = `${icon(ui.chatOpen ? 'x' : 'chat')}<span class="label">${ui.chatOpen ? 'Đóng' : 'Nhắn tin quản lý'}</span>${unread && !ui.chatOpen ? `<span class="badge">${unread}</span>` : ''}`;
  panel.hidden = !ui.chatOpen;
  if (!ui.chatOpen) return;
  const draft = $('#chatInput')?.value || '';
  const hour = new Date().getHours(), online = hour >= 5 && hour < 22;
  const head = `<div class="chat-head"><span class="avatar" style="--c:var(--accent)">QL</span><div><b>Quản lý Gang Thép</b><small style="--c:${online ? 'var(--ok)' : 'var(--off)'}">${online ? 'Đang trực, thường trả lời trong 15 phút' : 'Ngoài giờ, sẽ trả lời từ 5:00 sáng'}</small></div>
    <button class="btn btn-ghost btn-sm btn-icon" data-action="toggle-chat" aria-label="Đóng">${icon('x')}</button></div>`;
  if (!u) {
    panel.innerHTML = head + `<div class="chat-guest"><p>Đăng nhập để nhắn tin với quản lý. Lịch sử trò chuyện được lưu trong tài khoản để bạn xem lại.</p>
      <div style="display:flex;gap:8px"><button class="btn btn-primary" data-go="login" style="flex:1">Đăng nhập</button><button class="btn" data-go="register" style="flex:1">Đăng ký</button></div>
      <p style="font-size:13px">Cần gấp? Gọi hotline <b class="num" style="color:var(--ink)">${GYM.hotline}</b> hoặc để lại lời nhắn ở mục <button class="link" data-scroll="contact">Liên hệ</button>.</p></div>`;
    return;
  }
  const msgs = db.messages.filter(m => m.userId === u.id).sort((a, b) => a.at - b.at);
  let changed = false; msgs.forEach(m => { if (m.from === 'admin' && !m.readByUser) { m.readByUser = true; changed = true; } }); if (changed) save();
  panel.innerHTML = head + `<div class="msgs" id="chatMsgs">${renderMsgs(msgs, 'user')}</div>
    <div class="quick">${['Tư vấn giúp mình gói tập phù hợp', 'Mình đã chuyển khoản, nhờ xác nhận', 'Mình muốn đặt lịch PT'].map(q => `<button type="button" data-action="quick-msg" data-text="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="composer" id="chatForm" autocomplete="off"><input id="chatInput" name="text" placeholder="Nhập tin nhắn…" aria-label="Nội dung tin nhắn" maxlength="500"><button class="btn btn-primary btn-icon" type="submit" aria-label="Gửi">${icon('send')}</button></form>`;
  if (draft) $('#chatInput').value = draft;
  const box = $('#chatMsgs'); box.scrollTop = box.scrollHeight;
}

function sendUserMessage(text) {
  const u = me(); text = text.trim(); if (!u || !text) return;
  db.messages.push({ id: uid('m'), userId: u.id, from: 'user', text, at: Date.now(), readByAdmin: false, readByUser: true });
  const todayStart = +today();
  const repliedToday = db.messages.some(m => m.userId === u.id && m.from === 'admin' && m.at >= todayStart);
  save(); renderChat();
  if (!repliedToday) {
    setTimeout(() => {
      systemMessage(u.id, `Chào ${firstName(u.name)}, quản lý đã nhận được tin nhắn và sẽ phản hồi sớm nhất. Nếu cần gấp, bạn gọi hotline ${GYM.hotline} nhé.`);
      save(); renderChat();
    }, 900);
  }
}

function sendAdminMessage(text) {
  text = text.trim(); if (!text || !ui.adminConv) return;
  db.messages.push({ id: uid('m'), userId: ui.adminConv, from: 'admin', text, at: Date.now(), readByAdmin: true, readByUser: false });
  save();
  $('#adminMsg').value = '';
  renderAdmin();
  $('#adminMsg')?.focus();
}

/* ---------- 11. MODAL, TOAST, QUẢNG CÁO, HIỆU ỨNG ---------- */
function toast(msg, ok = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (ok ? ' ok' : '');
  el.innerHTML = icon(ok ? 'check' : 'alert') + `<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

let modalCleanup = null;
function closeModal() { if (modalCleanup) { modalCleanup(); modalCleanup = null; } $('#modalRoot').innerHTML = ''; }

function modal({ title, body, submit = 'Lưu', danger = false, onSubmit, onOpen }) {
  closeModal();
  $('#modalRoot').innerHTML = `<div class="overlay" data-action="overlay">
    <form class="modal" id="modalForm" novalidate role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-head"><h2 id="modalTitle">${title}</h2><button type="button" class="btn btn-ghost btn-icon" data-action="close-modal" aria-label="Đóng">${icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      <div class="modal-foot"><button type="button" class="btn" data-action="close-modal">Hủy</button><button type="submit" class="btn ${danger ? 'btn-danger' : 'btn-primary'}">${submit}</button></div>
    </form></div>`;
  const form = $('#modalForm');
  form.addEventListener('submit', e => {
    e.preventDefault(); clearErr(form);
    if (onSubmit(Object.fromEntries(new FormData(form)), form) !== false) closeModal();
  });
  if (onOpen) onOpen(form);
  setTimeout(() => form.querySelector('input:not([type=radio]),select,textarea,button[type=submit]')?.focus(), 40);
}

function confirmModal(title, text, submit, onYes, danger = true) {
  modal({ title, body: `<p>${text}</p>`, submit, danger, onSubmit() { onYes(); } });
}

// Popup quảng cáo khai trương, có đồng hồ đếm ngược
function showPromo() {
  if (!promoActive() || view !== 'home' || ssGet('promo-seen')) return;
  ssSet('promo-seen', '1');
  const p = planById(PROMO.plan), end = new Date(parse(PROMO.end).getTime() + DAY - 1000);
  closeModal();
  $('#modalRoot').innerHTML = `<div class="overlay" data-action="overlay"><div class="modal promo" role="dialog" aria-modal="true" aria-labelledby="promoTitle">
    <div class="promo-art"><span class="stamp">Khai trương</span>
      <svg viewBox="0 0 400 400" aria-hidden="true" class="spin"><circle cx="200" cy="200" r="190" fill="rgba(0,0,0,.14)"/><circle cx="200" cy="200" r="130" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3"/><circle cx="200" cy="200" r="40" fill="rgba(0,0,0,.25)"/></svg>
      <div class="off">-${PROMO.percent}%<small>Gói ${esc(p.name)} 12 tháng</small></div></div>
    <div class="promo-body"><button class="btn btn-ghost btn-icon close" data-action="close-modal" aria-label="Đóng quảng cáo">${icon('x')}</button>
      <span class="eyebrow" style="color:var(--muted)">Ưu đãi có hạn</span>
      <h2 id="promoTitle">Mừng khai trương cơ sở Cầu Giấy</h2>
      <p>Chỉ còn <b class="num" style="color:var(--ink)">${vnd(planPrice(p))}</b> thay vì <s>${vnd(p.price)}</s> cho cả năm tập luyện, tức khoảng ${vnd(Math.round(planPrice(p) / 365 / 1000) * 1000)} mỗi ngày.</p>
      <div class="countdown" id="countdown"></div>
      <ul class="promo-list"><li>${icon('check')}<span>4 buổi PT 1 kèm 1 và tủ đồ cố định</span></li><li>${icon('check')}<span>Miễn phí tất cả lớp nhóm Yoga, Boxing, HIIT</span></li><li>${icon('check')}<span>Áp dụng đến hết ngày ${fmtDate(PROMO.end)}</span></li></ul>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-lg" data-action="promo-cta" style="flex:1">Nhận ưu đãi ngay</button><button class="btn btn-lg" data-action="close-modal">Để sau</button></div>
    </div></div></div>`;
  const tick = () => {
    const el = $('#countdown'); if (!el) return;
    let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const parts = [[Math.floor(s / 86400), 'Ngày'], [Math.floor(s % 86400 / 3600), 'Giờ'], [Math.floor(s % 3600 / 60), 'Phút'], [s % 60, 'Giây']];
    el.innerHTML = parts.map(([v, l]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  };
  tick(); const timer = setInterval(tick, 1000);
  modalCleanup = () => clearInterval(timer);
}

// Đếm số trong hero từ 0 → giá trị thật
function countUp() {
  if (reducedMotion()) return;
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const step = now => { const k = Math.min(1, (now - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString('vi-VN') + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

function runSplash() {
  const splash = $('#splash'), pct = $('#splashPct');
  if (!splash) return;
  if (reducedMotion()) { splash.remove(); return; }
  const t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / 2100); pct.textContent = Math.round(k * 100) + '%'; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
  setTimeout(() => splash.remove(), 3300);
}


// Xem ảnh phóng to (lightbox) cho mục Không gian tập luyện
const GALLERY = [
  ['images/gym-2.jpg', 'Khu máy kéo cáp', 'Lối đi kẻ vạch để tập kéo xe trượt, đẩy sled'],
  ['images/gym-1.jpg', 'Đường chạy sled', 'Sàn cỏ nhân tạo dài 20 m'],
  ['images/gym-3.jpg', 'Khu tạ tự do', 'Ghế đẩy ngực, khung squat, máy chạy']
];
let lbIndex = -1;
function openLightbox(i) {
  lbIndex = (i + GALLERY.length) % GALLERY.length;
  const [src, title, sub] = GALLERY[lbIndex];
  let box = $('#lightbox');
  if (!box) { box = document.createElement('div'); box.id = 'lightbox'; box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.dataset.action = 'lb-backdrop'; document.body.appendChild(box); }
  box.innerHTML = `<button class="lb-btn lb-close" data-action="lb-close" aria-label="Đóng">${icon('x')}</button>
    <button class="lb-btn lb-prev" data-action="lb-prev" aria-label="Ảnh trước"><svg class="icon" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg></button>
    <img src="${src}" alt="${esc(title)}">
    <p><b>${esc(title)}</b><span>${esc(sub)}</span></p><span class="lb-count">${lbIndex + 1} / ${GALLERY.length}</span>
    <button class="lb-btn lb-next" data-action="lb-next" aria-label="Ảnh sau"><svg class="icon" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></button>`;
  box.querySelector('.lb-close').focus();
}
function closeLightbox() { $('#lightbox')?.remove(); lbIndex = -1; }

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Đã sao chép ' + text, true); }
  catch (e) { toast('Số hotline: ' + text + ' (hãy bôi đen để sao chép)'); }
}

// Giao diện sáng/tối
function isDark() { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }

/* ---------- 12. SỰ KIỆN ---------- */
document.addEventListener('click', e => {
  const goEl = e.target.closest('[data-go]');
  if (goEl) { e.preventDefault(); closeModal(); return go(goEl.dataset.go); }
  const sc = e.target.closest('[data-scroll]');
  if (sc) { e.preventDefault(); closeModal(); closeMobileMenu(); if (ui.chatOpen && sc.closest('#chatPanel')) { ui.chatOpen = false; renderChat(); } if (view !== 'home') { pendingScroll = sc.dataset.scroll; go('home'); } else scrollToSection(sc.dataset.scroll); return; }
  const el = e.target.closest('[data-action]'); if (!el) return;
  const { action, id } = el.dataset;
  switch (action) {
    case 'overlay': if (e.target === el) closeModal(); break;
    case 'lightbox': openLightbox(+el.dataset.index); break;
    case 'lb-close': closeLightbox(); break;
    case 'lb-backdrop': if (e.target === el) closeLightbox(); break;
    case 'lb-prev': openLightbox(lbIndex - 1); break;
    case 'lb-next': openLightbox(lbIndex + 1); break;
    case 'close-modal': closeModal(); break;
    case 'toggle-pw': { const inp = document.getElementById(el.dataset.for); inp.type = inp.type === 'password' ? 'text' : 'password'; break; }
    case 'demo-fill': $('#lg-id').value = el.dataset.u; $('#lg-pass').value = el.dataset.p; break;
    case 'logout': logout(); break;
    case 'choose-plan': choosePlan(id); break;
    case 'start-trial': startTrial(); break;
    case 'change-plan': { const a = activeSub(me().id); if (a) changeModal(a); break; }
    case 'renew': { const a = activeSub(me().id); if (a) renewModal(a); break; }
    case 'cancel-sub': confirmModal('Hủy gói tập?', 'Gói sẽ ngừng hiệu lực ngay lập tức và không hoàn lại tiền cho những ngày còn lại. Nếu chỉ muốn chuyển gói, hãy dùng "Đổi sang gói khác" để được trừ giá trị còn lại.', 'Hủy gói', () => {
      const s = db.subs.find(x => x.id === id); s.status = 'cancelled'; s.cancelledAt = Date.now(); save(); afterChange('Đã hủy gói tập.'); }); break;
    case 'cancel-request': confirmModal('Hủy yêu cầu?', 'Yêu cầu đang chờ xác nhận sẽ bị hủy. Bạn có thể gửi yêu cầu mới bất cứ lúc nào.', 'Hủy yêu cầu', () => {
      const s = db.subs.find(x => x.id === id); s.status = 'cancelled'; save(); afterChange('Đã hủy yêu cầu.'); }); break;
    case 'toggle-chat':
      if (me()?.role === 'admin') { ui.adminTab = 'inbox'; go('admin'); break; }
      ui.chatOpen = !ui.chatOpen; renderChat(); if (ui.chatOpen) $('#chatInput')?.focus(); break;
    case 'open-chat':
      if (me()?.role === 'admin') { ui.adminTab = 'inbox'; go('admin'); break; }
      ui.chatOpen = true; renderChat(); $('#chatInput')?.focus(); break;
    case 'quick-msg': sendUserMessage(el.dataset.text); break;
    case 'copy': copyText(el.dataset.text); break;
    case 'promo-cta': closeModal(); choosePlan(PROMO.plan); break;
    case 'admin-tab': ui.adminTab = el.dataset.tab; renderAdmin(); renderChat(); break;
    case 'admin-conv': ui.adminConv = id; if ($('#adminMsg')) $('#adminMsg').value = ''; renderAdmin(); $('#adminMsg')?.focus(); break;
    case 'admin-chat': ui.adminTab = 'inbox'; ui.adminConv = id; renderAdmin(); $('#adminMsg')?.focus(); break;
    case 'confirm-req': confirmRequest(id); renderAdmin(); toast('Đã xác nhận và kích hoạt gói cho hội viên.', true); break;
    case 'reject-req': modal({ title: 'Từ chối yêu cầu', submit: 'Từ chối', danger: true,
      body: `<div class="field"><label for="rj-reason">Lý do (gửi kèm tin nhắn cho hội viên)</label><input id="rj-reason" name="reason" placeholder="Ví dụ: chưa nhận được chuyển khoản"></div>`,
      onSubmit(d) { rejectRequest(id, d.reason.trim()); renderAdmin(); toast('Đã từ chối yêu cầu.'); } }); break;
    case 'toggle-contact': { const c = db.contacts.find(x => x.id === id); c.done = !c.done; save(); renderAdmin(); break; }
    case 'edit-plan': editPlanModal(planById(id)); break;
    case 'delete-user': { const u = userById(id); confirmModal('Xoá hội viên?', `Tài khoản <b style="color:var(--ink)">${esc(u.name)}</b> (${u.code}), toàn bộ gói tập và tin nhắn sẽ bị xoá vĩnh viễn.`, 'Xoá vĩnh viễn', () => {
      db.users = db.users.filter(x => x.id !== id); db.subs = db.subs.filter(s => s.userId !== id); db.messages = db.messages.filter(m => m.userId !== id);
      if (ui.adminConv === id) ui.adminConv = null; save(); renderAdmin(); toast('Đã xoá hội viên.'); }); break; }
    case 'reset': confirmModal('Khôi phục dữ liệu mẫu?', 'Mọi tài khoản, gói tập và tin nhắn bạn đã tạo sẽ bị thay bằng dữ liệu mẫu ban đầu.', 'Khôi phục', async () => {
      db = await seed(); save(); lsSet(SESSION_KEY, ''); ui.chatOpen = false; toast('Đã khôi phục dữ liệu mẫu.', true); go('home'); renderPlans(); }); break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target;
  const handlers = {
    loginForm: () => handleLogin(f), registerForm: () => handleRegister(f), profileForm: () => handleProfile(f), passwordForm: () => handlePassword(f),
    chatForm: () => { const inp = $('#chatInput'); const v = inp.value; inp.value = ''; sendUserMessage(v); $('#chatInput')?.focus(); },
    adminComposer: () => sendAdminMessage($('#adminMsg').value),
    contactForm: () => {
      clearErr(f);
      const d = Object.fromEntries(new FormData(f)), phone = d.phone.replace(/\s/g, '');
      let ok = true;
      if (d.name.trim().length < 2) { setErr(f, 'name', 'Nhập tên của bạn.'); ok = false; }
      if (!PHONE_RE.test(phone)) { setErr(f, 'phone', 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.'); ok = false; }
      if (d.message.trim().length < 5) { setErr(f, 'message', 'Viết vài dòng để chúng tôi tư vấn đúng nhu cầu.'); ok = false; }
      if (!ok) return;
      db.contacts.push({ id: uid('c'), name: d.name.trim(), phone, topic: d.topic, message: d.message.trim(), at: Date.now(), done: false });
      save(); f.reset(); toast('Đã gửi lời nhắn. Chúng tôi sẽ gọi lại trong giờ làm việc.', true);
    }
  };
  if (handlers[f.id]) { e.preventDefault(); handlers[f.id](); }
});

document.addEventListener('input', e => {
  if (e.target.id === 'rg-pass') {
    const v = e.target.value; let s = 0;
    if (v.length >= 6) s++; if (v.length >= 10) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
    $('#pwStrength').dataset.s = v ? Math.max(1, s) : 0;
  }
  if (e.target.id === 'memberSearch') {
    ui.memberQ = e.target.value; const pos = e.target.selectionStart; renderAdmin();
    const inp = $('#memberSearch'); inp.focus(); inp.setSelectionRange(pos, pos);
  }
});

document.addEventListener('keydown', e => {
  if (lbIndex >= 0) { if (e.key === 'Escape') closeLightbox(); if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1); if (e.key === 'ArrowRight') openLightbox(lbIndex + 1); return; }
  if (e.key === 'Escape') { if ($('#modalRoot').innerHTML) closeModal(); else if (ui.chatOpen) { ui.chatOpen = false; renderChat(); } } });

$('#menuBtn').addEventListener('click', () => {
  const m = $('#mobileMenu'); m.hidden = !m.hidden;
  $('#menuBtn').setAttribute('aria-expanded', String(!m.hidden)); $('#menuBtn').innerHTML = icon(m.hidden ? 'menu' : 'x');
});
$('#themeBtn').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; lsSet(KEY + '-theme', next);
  $('#themeBtn').innerHTML = icon(isDark() ? 'sun' : 'moon');
});

// Đồng bộ giữa các tab: mở trang quản trị ở tab khác sẽ thấy tin nhắn mới ngay
window.addEventListener('storage', e => {
  if (e.key === KEY && e.newValue) { try { db = JSON.parse(e.newValue); } catch (err) { return; } if (view !== 'login' && view !== 'register') renderView(); renderChat(); renderHeader(); }
  if (e.key === SESSION_KEY) route();
});
window.addEventListener('hashchange', route);

/* ---------- KHỞI ĐỘNG ---------- */
(async function init() {
  const th = lsGet(KEY + '-theme'); if (th) document.documentElement.dataset.theme = th;
  runSplash();
  db = await loadDB();
  route();
  setTimeout(countUp, reducedMotion() ? 0 : 2900);
  setTimeout(showPromo, reducedMotion() ? 600 : 3800);
})();
