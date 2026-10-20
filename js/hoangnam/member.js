/* =========================================================
   GANG THÉP GYM — js/member.js
   Người phụ trách: Quản Hoàng Nam
   Trang tài khoản hội viên: gói đang dùng, lịch sử đăng ký,
   đăng ký gói / đổi gói / gia hạn / hủy, vé tập thử, sửa hồ sơ, đổi mật khẩu.
   ========================================================= */
'use strict';

function renderAccount() {
  const u = me(); if (!u) return;
  const act = activeSub(u.id), pend = pendingSub(u.id);
  const hist = db.subs.filter(s => s.userId === u.id).sort((a, b) => b.createdAt - a.createdAt);
  const usedTrial = !canTrial(u.id);
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

// Được nhận vé tập thử nếu chưa từng tập thử và chưa từng có gói nào được kích hoạt
// (yêu cầu đã hủy hoặc bị từ chối không tính)
const canTrial = userId => !db.subs.some(s => s.userId === userId && (s.kind === 'trial' || s.confirmedAt));

function startTrial() {
  const u = me();
  if (!u) { afterAuth = { trial: true }; return go('register'); }
  if (u.role === 'admin') return toast('Tài khoản quản lý không cần tập thử.');
  if (!canTrial(u.id)) { toast('Vé tập thử chỉ dành cho thành viên chưa từng đăng ký gói.'); return go('account'); }
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

/* ---------- Sự kiện của module ---------- */
onAction({
  'choose-plan': el => choosePlan(el.dataset.id),
  'start-trial': () => startTrial(),
  'change-plan': () => { const a = activeSub(me().id); if (a) changeModal(a); },
  'renew': () => { const a = activeSub(me().id); if (a) renewModal(a); },
  'cancel-sub': el => confirmModal('Hủy gói tập?', 'Gói sẽ ngừng hiệu lực ngay lập tức và không hoàn lại tiền cho những ngày còn lại. Nếu chỉ muốn chuyển gói, hãy dùng "Đổi sang gói khác" để được trừ giá trị còn lại.', 'Hủy gói', () => {
    const s = db.subs.find(x => x.id === el.dataset.id); s.status = 'cancelled'; s.cancelledAt = Date.now(); save(); afterChange('Đã hủy gói tập.');
  }),
  'cancel-request': el => confirmModal('Hủy yêu cầu?', 'Yêu cầu đang chờ xác nhận sẽ bị hủy. Bạn có thể gửi yêu cầu mới bất cứ lúc nào.', 'Hủy yêu cầu', () => {
    const s = db.subs.find(x => x.id === el.dataset.id); s.status = 'cancelled'; save(); afterChange('Đã hủy yêu cầu.');
  })
});

onForm({
  profileForm: f => handleProfile(f),
  passwordForm: f => handlePassword(f)
});
