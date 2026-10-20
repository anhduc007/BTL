const nguoi = batBuocDangNhap();
const thamSo = new URLSearchParams(window.location.search);
const maDoi = thamSo.get('doi');
const danhSachDangKy = layDuLieu('dangKyGoi');
const goiCu = danhSachDangKy.find(function (dk) {
  return String(dk.id) === maDoi && nguoi && dk.email === nguoi.email;
});

const oGoi = document.getElementById('goiTap');
const oNgayBatDau = document.getElementById('ngayBatDau');
const oNgayKetThuc = document.getElementById('ngayKetThuc');

GOI_TAP.forEach(function (goi) {
  if (goiCu && goi.ma === goiCu.maGoi) return;
  oGoi.innerHTML += `<option value="${goi.ma}">${goi.ten} – ${dinhDangTien(goi.gia)}</option>`;
});

if (nguoi) {
  document.getElementById('hoTen').value = nguoi.hoTen;
  document.getElementById('sdt').value = nguoi.sdt;
}
oNgayBatDau.value = homNay();
oNgayBatDau.min = homNay();

if (thamSo.get('goi')) oGoi.value = thamSo.get('goi');

if (goiCu) {
  document.getElementById('tieuDeForm').textContent = `Đổi từ ${timGoi(goiCu.maGoi).ten} sang gói khác`;
  document.getElementById('nutGui').textContent = 'Xác nhận đổi gói';
  document.getElementById('diaChi').value = goiCu.diaChi;
  document.getElementById('sdt').value = goiCu.sdt;
}

function capNhatTomTat() {
  const goi = timGoi(oGoi.value);
  if (oNgayBatDau.value) {
    oNgayKetThuc.value = dinhDangNgay(congThang(oNgayBatDau.value, goi.thang));
  }
  document.getElementById('tongTien').textContent = dinhDangTien(goi.gia);
}
oGoi.addEventListener('change', capNhatTomTat);
oNgayBatDau.addEventListener('change', capNhatTomTat);
capNhatTomTat();

document.getElementById('formDangKyGoi').addEventListener('submit', function (suKien) {
  suKien.preventDefault();

  const hoTen = document.getElementById('hoTen').value.trim();
  const sdt = document.getElementById('sdt').value.trim();
  const diaChi = document.getElementById('diaChi').value.trim();
  const ngayBatDau = oNgayBatDau.value;
  let hopLe = true;

  ['loiHoTen', 'loiSdt', 'loiDiaChi', 'loiNgay'].forEach(function (id) {
    document.getElementById(id).textContent = '';
  });

  if (hoTen.length < 2) {
    document.getElementById('loiHoTen').textContent = 'Vui lòng nhập họ tên.';
    hopLe = false;
  }
  if (!/^0\d{9}$/.test(sdt)) {
    document.getElementById('loiSdt').textContent = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.';
    hopLe = false;
  }
  if (diaChi.length < 5) {
    document.getElementById('loiDiaChi').textContent = 'Vui lòng nhập địa chỉ.';
    hopLe = false;
  }
  if (!ngayBatDau || ngayBatDau < homNay()) {
    document.getElementById('loiNgay').textContent = 'Chọn ngày từ hôm nay trở đi.';
    hopLe = false;
  }
  if (!hopLe) return;

  const goi = timGoi(oGoi.value);

  if (goiCu) {
    goiCu.trangThai = goiCu.trangThai === 'da-duyet' ? 'da-doi' : 'da-huy';
  }

  danhSachDangKy.push({
    id: Date.now(),
    email: nguoi.email,
    hoTen: hoTen,
    sdt: sdt,
    diaChi: diaChi,
    maGoi: goi.ma,
    ngayDangKy: homNay(),
    ngayBatDau: ngayBatDau,
    ngayKetThuc: congThang(ngayBatDau, goi.thang),
    soTien: goi.gia,
    trangThai: 'cho-duyet'
  });
  luuDuLieu('dangKyGoi', danhSachDangKy);

  hienThongBao(goiCu ? 'Đã gửi yêu cầu đổi gói!' : 'Đăng ký thành công! Vui lòng thanh toán tại quầy.');
  setTimeout(function () {
    window.location.href = 'goi-cua-toi.html';
  }, 1200);
});
