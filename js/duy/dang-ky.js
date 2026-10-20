const formDangKy = document.getElementById('formDangKy');

function baoLoi(idLoi, noiDung) {
  document.getElementById(idLoi).textContent = noiDung;
}

formDangKy.addEventListener('submit', function (suKien) {
  suKien.preventDefault();

  const hoTen = document.getElementById('hoTen').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const sdt = document.getElementById('sdt').value.trim();
  const matKhau = document.getElementById('matKhau').value;
  const nhapLai = document.getElementById('nhapLai').value;

  ['loiHoTen', 'loiEmail', 'loiSdt', 'loiMatKhau', 'loiNhapLai'].forEach(function (id) {
    baoLoi(id, '');
  });

  const danhSachTaiKhoan = layDuLieu('taiKhoan');
  const daCoEmail = danhSachTaiKhoan.some(function (tk) {
    return tk.email === email;
  });
  let hopLe = true;

  if (hoTen.length < 2) {
    baoLoi('loiHoTen', 'Vui lòng nhập họ tên.');
    hopLe = false;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    baoLoi('loiEmail', 'Email không đúng định dạng, ví dụ: ten@gmail.com');
    hopLe = false;
  } else if (daCoEmail) {
    baoLoi('loiEmail', 'Email này đã được đăng ký.');
    hopLe = false;
  }
  if (!/^0\d{9}$/.test(sdt)) {
    baoLoi('loiSdt', 'Số điện thoại gồm 10 chữ số và bắt đầu bằng số 0.');
    hopLe = false;
  }
  if (matKhau.length < 6) {
    baoLoi('loiMatKhau', 'Mật khẩu cần ít nhất 6 ký tự.');
    hopLe = false;
  }
  if (nhapLai !== matKhau) {
    baoLoi('loiNhapLai', 'Mật khẩu nhập lại không khớp.');
    hopLe = false;
  }

  if (!hopLe) return;

  const taiKhoanMoi = { hoTen: hoTen, email: email, sdt: sdt, matKhau: matKhau, vaiTro: 'hoivien' };
  danhSachTaiKhoan.push(taiKhoanMoi);
  luuDuLieu('taiKhoan', danhSachTaiKhoan);
  localStorage.setItem('nguoiDangNhap', JSON.stringify(taiKhoanMoi));

  hienThongBao(`Đăng ký thành công! Chào mừng ${hoTen}`);
  setTimeout(function () {
    window.location.href = 'dang-ky-goi.html';
  }, 1200);
});
