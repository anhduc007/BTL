/* =========================================================
   GANG THÉP GYM — js/chat.js
   Người phụ trách: Bùi Hoàng Hiệp
   Nhắn tin giữa hội viên và quản lý: khung chat nổi, tin nhắn
   mẫu, trả lời tự động, hộp thư phía quản lý.
   ========================================================= */
'use strict';

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

/* ---------- Sự kiện của module ---------- */
function openChat(toggle) {
  if (me()?.role === 'admin') { ui.adminTab = 'inbox'; go('admin'); return; }
  ui.chatOpen = toggle ? !ui.chatOpen : true; renderChat();
  if (ui.chatOpen) $('#chatInput')?.focus();
}
onAction({
  'toggle-chat': () => openChat(true),
  'open-chat': () => openChat(false),
  'quick-msg': el => sendUserMessage(el.dataset.text)
});

onForm({
  chatForm: () => { const inp = $('#chatInput'); const v = inp.value; inp.value = ''; sendUserMessage(v); $('#chatInput')?.focus(); },
  adminComposer: () => sendAdminMessage($('#adminMsg').value)
});

onKey(e => { if (e.key === 'Escape' && ui.chatOpen) { ui.chatOpen = false; renderChat(); return true; } return false; });
