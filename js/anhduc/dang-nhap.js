document.getElementById('formDangNhap').addEventListener('submit', function (suKien) {
  suKien.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const matKhau = document.getElementById('matKhau').value;
  const oLoi = document.getElementById('loiDangNhap');

  const taiKhoan = layDuLieu('taiKhoan').find(function (tk) {
    return tk.email === email;
  });

  if (!taiKhoan) {
    oLoi.textContent = 'Không tìm thấy tài khoản với email này.';
    return;
  }
  if (taiKhoan.matKhau !== matKhau) {
    oLoi.textContent = 'Mật khẩu không đúng.';
    return;
  }

  localStorage.setItem('nguoiDangNhap', JSON.stringify(taiKhoan));
  if (taiKhoan.vaiTro === 'quanly') {
    window.location.href = 'quan-ly.html';
  } else {
    window.location.href = 'goi-cua-toi.html';
  }
});
