const GOI_TAP = [
  {
    ma: 'goi1',
    ten: 'Gói 1 tháng',
    thang: 1,
    gia: 450000,
    mau: '#23905A',
    quyenLoi: ['Tập không giới hạn giờ', 'Tủ đồ theo ngày', 'Hướng dẫn máy buổi đầu']
  },
  {
    ma: 'goi3',
    ten: 'Gói 3 tháng',
    thang: 3,
    gia: 1200000,
    mau: '#D9A40B',
    quyenLoi: ['Tập không giới hạn giờ', 'Tủ đồ theo ngày', '1 lần đo InBody']
  },
  {
    ma: 'goi6',
    ten: 'Gói 6 tháng',
    thang: 6,
    gia: 2200000,
    mau: '#2563D6',
    quyenLoi: ['Quyền lợi gói 3 tháng', 'Miễn phí lớp Yoga, Boxing', '2 lần đo InBody']
  },
  {
    ma: 'goi12',
    ten: 'Gói 12 tháng',
    thang: 12,
    gia: 3900000,
    mau: '#D3241C',
    quyenLoi: ['Quyền lợi gói 6 tháng', '4 buổi tập với huấn luyện viên', 'Tủ đồ cố định']
  }
];

function timGoi(ma) {
  return GOI_TAP.find(function (g) {
    return g.ma === ma;
  });
}

function layDuLieu(khoa) {
  return JSON.parse(localStorage.getItem(khoa)) || [];
}

function luuDuLieu(khoa, giaTri) {
  localStorage.setItem(khoa, JSON.stringify(giaTri));
}

function nguoiDangNhap() {
  return JSON.parse(localStorage.getItem('nguoiDangNhap'));
}

if (layDuLieu('taiKhoan').length === 0) {
  luuDuLieu('taiKhoan', [
    {
      hoTen: 'Quản lý Gang Thép',
      email: 'admin@gym.vn',
      sdt: '0987654321',
      matKhau: 'admin123',
      vaiTro: 'quanly'
    }
  ]);
}

function dinhDangTien(soTien) {
  return soTien.toLocaleString('vi-VN') + ' đ';
}

function dinhDangNgay(chuoiNgay) {
  const phan = chuoiNgay.split('-');
  return `${phan[2]}/${phan[1]}/${phan[0]}`;
}

function doiSangChuoi(d) {
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngay = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${thang}-${ngay}`;
}

function homNay() {
  return doiSangChuoi(new Date());
}

function congThang(chuoiNgay, soThang) {
  const phan = chuoiNgay.split('-');
  return doiSangChuoi(new Date(phan[0], phan[1] - 1 + soThang, phan[2]));
}

function tinhTrangThai(dangKy) {
  if (dangKy.trangThai === 'cho-duyet') return { chu: 'Chờ duyệt', lop: 'nhan-vang' };
  if (dangKy.trangThai === 'da-huy') return { chu: 'Đã hủy', lop: 'nhan-xam' };
  if (dangKy.trangThai === 'da-doi') return { chu: 'Đã đổi gói', lop: 'nhan-xam' };
  if (homNay() < dangKy.ngayBatDau) return { chu: 'Chưa bắt đầu', lop: 'nhan-vang' };
  if (homNay() > dangKy.ngayKetThuc) return { chu: 'Hết hạn', lop: 'nhan-xam' };
  return { chu: 'Đang tập', lop: 'nhan-xanh' };
}

function anToan(chuoi) {
  const tam = document.createElement('div');
  tam.textContent = chuoi;
  return tam.innerHTML;
}

function hienThongBao(noiDung) {
  const tb = document.createElement('div');
  tb.className = 'thong-bao';
  tb.textContent = noiDung;
  document.body.appendChild(tb);
  setTimeout(function () {
    tb.remove();
  }, 3000);
}

function batBuocDangNhap() {
  const nguoi = nguoiDangNhap();
  if (!nguoi) {
    window.location.href = 'dang-nhap.html';
  }
  return nguoi;
}

function capNhatMenu() {
  const khuVuc = document.getElementById('khuVucTaiKhoan');
  if (!khuVuc) return;
  const nguoi = nguoiDangNhap();

  if (!nguoi) {
    khuVuc.innerHTML = `
      <a href="dang-nhap.html" class="nut nut-vien">Đăng nhập</a>
      <a href="dang-ky.html" class="nut">Đăng ký</a>
    `;
    return;
  }

  let lienKet = '<a href="goi-cua-toi.html">Gói của tôi</a><a href="tin-nhan.html">Nhắn tin</a>';
  if (nguoi.vaiTro === 'quanly') {
    lienKet = '<a href="quan-ly.html">Trang quản lý</a>';
  }
  khuVuc.innerHTML = `
    ${lienKet}
    <span class="xin-chao">Xin chào, <b>${anToan(nguoi.hoTen)}</b></span>
    <button class="nut nut-vien" id="nutDangXuat">Đăng xuất</button>
  `;

  document.getElementById('nutDangXuat').addEventListener('click', function () {
    localStorage.removeItem('nguoiDangNhap');
    window.location.href = 'index.html';
  });
}

function ganNutMenu() {
  const nut = document.getElementById('nutMenu');
  const menu = document.getElementById('menuChinh');
  if (!nut) return;
  nut.addEventListener('click', function () {
    menu.classList.toggle('mo');
  });
}

capNhatMenu();
ganNutMenu();
