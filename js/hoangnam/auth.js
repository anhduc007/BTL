/* =========================================================
   GANG THÉP GYM — js/auth.js
   Người phụ trách: Quản Hoàng Nam
   Đăng nhập, đăng ký (kiểm tra dữ liệu, độ mạnh mật khẩu),
   đăng xuất. Mật khẩu được băm SHA-256 trước khi lưu.
   ========================================================= */
'use strict';

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

/* ---------- Sự kiện của module ---------- */
onAction({
  'toggle-pw': el => { const inp = document.getElementById(el.dataset.for); inp.type = inp.type === 'password' ? 'text' : 'password'; },
  'demo-fill': el => { $('#lg-id').value = el.dataset.u; $('#lg-pass').value = el.dataset.p; },
  'logout': () => logout()
});

onForm({
  loginForm: f => handleLogin(f),
  registerForm: f => handleRegister(f)
});

// Thanh đo độ mạnh mật khẩu
onInput({
  'rg-pass': input => {
    const v = input.value; let s = 0;
    if (v.length >= 6) s++; if (v.length >= 10) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
    $('#pwStrength').dataset.s = v ? Math.max(1, s) : 0;
  }
});
