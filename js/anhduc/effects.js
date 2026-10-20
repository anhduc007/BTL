/* =========================================================
   GANG THÉP GYM — js/effects.js
   Người phụ trách: Lò Anh Đức (trưởng nhóm)
   Hiệu ứng: màn hình chào lắp đĩa tạ, đếm số ở hero,
   popup quảng cáo khai trương (đếm ngược), xem ảnh phóng to.
   ========================================================= */
'use strict';

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

/* ---------- Sự kiện của module ---------- */
onAction({
  'lightbox': el => openLightbox(+el.dataset.index),
  'lb-close': () => closeLightbox(),
  'lb-backdrop': (el, e) => { if (e.target === el) closeLightbox(); },
  'lb-prev': () => openLightbox(lbIndex - 1),
  'lb-next': () => openLightbox(lbIndex + 1),
  'promo-cta': () => { closeModal(); choosePlan(PROMO.plan); }
});
onKey(e => {
  if (lbIndex < 0) return false;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
  if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
  return true;
});
