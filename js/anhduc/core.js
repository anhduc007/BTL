/* =========================================================
   GANG THÉP GYM — js/core.js
   Người phụ trách: Lò Anh Đức (trưởng nhóm)
   Cấu hình phòng tập, hàm tiện ích, modal, thông báo (toast)
   và cơ chế đăng ký sự kiện để các module khác gắn chức năng vào.
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

/* ---------- 3. MODAL & THÔNG BÁO ---------- */
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

/* ---------- 4. ĐĂNG KÝ SỰ KIỆN ----------
   Thay vì một hàm switch khổng lồ, mỗi module tự đăng ký hành động của mình:
     onAction({ 'ten-hanh-dong': (el, e) => ... })  ← nút có data-action="ten-hanh-dong"
     onForm({ formId: form => ... })                ← form có id="formId"
     onInput({ inputId: input => ... })             ← ô nhập có id="inputId"
     onKey(e => true/false)                          ← trả về true nếu đã xử lý phím
   File js/main.js chỉ có 1 bộ lắng nghe cho cả trang và chuyển tới đúng hàm. */
const ACTIONS = {}, FORMS = {}, INPUTS = {}, KEYS = [];
const onAction = map => Object.assign(ACTIONS, map);
const onForm = map => Object.assign(FORMS, map);
const onInput = map => Object.assign(INPUTS, map);
const onKey = fn => KEYS.push(fn);

// Hành động chung của modal
onAction({
  'overlay': (el, e) => { if (e.target === el) closeModal(); },
  'close-modal': () => closeModal()
});
onKey(e => { if (e.key === 'Escape' && $('#modalRoot').innerHTML) { closeModal(); return true; } return false; });
