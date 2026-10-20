/* =========================================================
   GANG THÉP GYM — js/admin.js
   Người phụ trách: Bùi Hoàng Hiệp
   Trang quản trị: tổng quan, duyệt yêu cầu thanh toán, danh sách
   hội viên, hộp thư, lời nhắn liên hệ, sửa giá gói tập.
   ========================================================= */
'use strict';

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

/* ---------- Sự kiện của module ---------- */
onAction({
  'admin-tab': el => { ui.adminTab = el.dataset.tab; renderAdmin(); renderChat(); },
  'admin-conv': el => { ui.adminConv = el.dataset.id; if ($('#adminMsg')) $('#adminMsg').value = ''; renderAdmin(); $('#adminMsg')?.focus(); },
  'admin-chat': el => { ui.adminTab = 'inbox'; ui.adminConv = el.dataset.id; renderAdmin(); $('#adminMsg')?.focus(); },
  'confirm-req': el => { confirmRequest(el.dataset.id); renderAdmin(); toast('Đã xác nhận và kích hoạt gói cho hội viên.', true); },
  'reject-req': el => modal({
    title: 'Từ chối yêu cầu', submit: 'Từ chối', danger: true,
    body: `<div class="field"><label for="rj-reason">Lý do (gửi kèm tin nhắn cho hội viên)</label><input id="rj-reason" name="reason" placeholder="Ví dụ: chưa nhận được chuyển khoản"></div>`,
    onSubmit(d) { rejectRequest(el.dataset.id, d.reason.trim()); renderAdmin(); toast('Đã từ chối yêu cầu.'); }
  }),
  'toggle-contact': el => { const c = db.contacts.find(x => x.id === el.dataset.id); c.done = !c.done; save(); renderAdmin(); },
  'edit-plan': el => editPlanModal(planById(el.dataset.id)),
  'delete-user': el => {
    const id = el.dataset.id, u = userById(id);
    confirmModal('Xoá hội viên?', `Tài khoản <b style="color:var(--ink)">${esc(u.name)}</b> (${u.code}), toàn bộ gói tập và tin nhắn sẽ bị xoá vĩnh viễn.`, 'Xoá vĩnh viễn', () => {
      db.users = db.users.filter(x => x.id !== id); db.subs = db.subs.filter(s => s.userId !== id); db.messages = db.messages.filter(m => m.userId !== id);
      if (ui.adminConv === id) ui.adminConv = null; save(); renderAdmin(); toast('Đã xoá hội viên.');
    });
  }
});

// Ô tìm kiếm hội viên: vẽ lại bảng nhưng giữ nguyên con trỏ trong ô nhập
onInput({
  memberSearch: input => {
    ui.memberQ = input.value; const pos = input.selectionStart; renderAdmin();
    const inp = $('#memberSearch'); inp.focus(); inp.setSelectionRange(pos, pos);
  }
});
