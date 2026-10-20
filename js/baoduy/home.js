/* =========================================================
   GANG THÉP GYM — js/home.js
   Người phụ trách: Nguyễn Chí Bảo Duy
   Trang chủ: vẽ bảng giá, lịch lớp trong tuần, thông tin liên hệ
   và xử lý form "Để lại lời nhắn".
   ========================================================= */
'use strict';

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

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Đã sao chép ' + text, true); }
  catch (e) { toast('Số hotline: ' + text + ' (hãy bôi đen để sao chép)'); }
}

/* ---------- Sự kiện của module ---------- */
onAction({
  'copy': el => copyText(el.dataset.text)
});

onForm({
  contactForm: f => {
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
});
