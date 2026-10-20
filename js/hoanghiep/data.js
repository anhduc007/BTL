/* =========================================================
   GANG THÉP GYM — js/data.js
   Người phụ trách: Bùi Hoàng Hiệp
   Cơ sở dữ liệu (localStorage), dữ liệu mẫu và nghiệp vụ gói tập:
   tính giá, khuyến mãi, giá trị còn lại, xác nhận / từ chối yêu cầu.
   ========================================================= */
'use strict';

/* ---------- 1. CƠ SỞ DỮ LIỆU ---------- */
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

/* ---------- 2. NGHIỆP VỤ GÓI TẬP ---------- */
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
