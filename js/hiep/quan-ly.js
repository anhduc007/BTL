const quanLy = nguoiDangNhap();
if (!quanLy || quanLy.vaiTro !== 'quanly') {
  window.location.href = 'dang-nhap.html';
}

let emailDangChon = null;

function veSoLieu() {
  const dangKy = layDuLieu('dangKyGoi');
  const hoiVien = layDuLieu('taiKhoan').filter(function (tk) {
    return tk.vaiTro === 'hoivien';
  });
  let doanhThu = 0;
  dangKy.forEach(function (dk) {
    if (dk.trangThai === 'da-duyet' || dk.trangThai === 'da-doi') doanhThu += dk.soTien;
  });

  document.getElementById('soHoiVien').textContent = hoiVien.length;
  document.getElementById('soChoDuyet').textContent = dangKy.filter(function (dk) {
    return dk.trangThai === 'cho-duyet';
  }).length;
  document.getElementById('soDangTap').textContent = dangKy.filter(function (dk) {
    return tinhTrangThai(dk).chu === 'Đang tập';
  }).length;
  document.getElementById('doanhThu').textContent = dinhDangTien(doanhThu);
}

function veBangDangKy() {
  const dangKy = layDuLieu('dangKyGoi').reverse();
  const bang = document.getElementById('bangDangKy');

  if (dangKy.length === 0) {
    bang.innerHTML = '<tr><td colspan="9" class="trong">Chưa có đăng ký nào.</td></tr>';
    return;
  }
  bang.innerHTML = '';
  dangKy.forEach(function (dk) {
    const trangThai = tinhTrangThai(dk);
    let thaoTac = '–';
    if (dk.trangThai === 'cho-duyet') {
      thaoTac = `<button class="nut nut-nho" onclick="duyetDangKy(${dk.id})">Duyệt</button>`;
    }
    bang.innerHTML += `
      <tr>
        <td><b>${anToan(dk.hoTen)}</b></td>
        <td>${dk.sdt}</td>
        <td>${anToan(dk.diaChi)}</td>
        <td>${timGoi(dk.maGoi).ten}</td>
        <td>${dinhDangNgay(dk.ngayBatDau)}</td>
        <td>${dinhDangNgay(dk.ngayKetThuc)}</td>
        <td>${dinhDangTien(dk.soTien)}</td>
        <td><span class="nhan ${trangThai.lop}">${trangThai.chu}</span></td>
        <td>${thaoTac}</td>
      </tr>
    `;
  });
}

function duyetDangKy(id) {
  const danhSach = layDuLieu('dangKyGoi');
  const dk = danhSach.find(function (x) {
    return x.id === id;
  });
  dk.trangThai = 'da-duyet';
  luuDuLieu('dangKyGoi', danhSach);

  hienThongBao(`Đã duyệt gói cho ${dk.hoTen}`);
  veTatCa();
}

function veBangHoiVien() {
  const hoiVien = layDuLieu('taiKhoan').filter(function (tk) {
    return tk.vaiTro === 'hoivien';
  });
  const dangKy = layDuLieu('dangKyGoi');
  const bang = document.getElementById('bangHoiVien');

  if (hoiVien.length === 0) {
    bang.innerHTML = '<tr><td colspan="5" class="trong">Chưa có hội viên nào.</td></tr>';
    return;
  }
  bang.innerHTML = '';
  hoiVien.forEach(function (hv, viTri) {
    const soGoi = dangKy.filter(function (dk) {
      return dk.email === hv.email;
    }).length;
    bang.innerHTML += `
      <tr>
        <td>${viTri + 1}</td>
        <td>${anToan(hv.hoTen)}</td>
        <td>${anToan(hv.email)}</td>
        <td>${hv.sdt}</td>
        <td>${soGoi}</td>
      </tr>
    `;
  });
}

function veTinNhan() {
  const tatCaTin = layDuLieu('tinNhan');
  const taiKhoan = layDuLieu('taiKhoan');
  const khungChon = document.getElementById('chonHoiVien');
  const khungTin = document.getElementById('danhSachTin');

  const cacEmail = [];
  tatCaTin.forEach(function (t) {
    if (cacEmail.indexOf(t.email) === -1) cacEmail.push(t.email);
  });

  if (cacEmail.length === 0) {
    khungChon.innerHTML = '';
    khungTin.innerHTML = '<p class="trong">Chưa có hội viên nào nhắn tin.</p>';
    return;
  }
  if (!emailDangChon) emailDangChon = cacEmail[0];

  khungChon.innerHTML = '';
  cacEmail.forEach(function (email) {
    const tk = taiKhoan.find(function (x) {
      return x.email === email;
    });
    const lop = email === emailDangChon ? 'nut nut-nho' : 'nut nut-nho nut-xam';
    const ten = tk ? tk.hoTen : email;
    khungChon.innerHTML += `<button class="${lop}" onclick="chonHoiVien('${email}')">${anToan(ten)}</button>`;
  });

  khungTin.innerHTML = '';
  tatCaTin
    .filter(function (t) {
      return t.email === emailDangChon;
    })
    .forEach(function (t) {
      const lop = t.tu === 'quanly' ? 'tin cua-toi' : 'tin';
      khungTin.innerHTML += `<div class="${lop}">${anToan(t.noiDung)}</div>`;
    });
  khungTin.scrollTop = khungTin.scrollHeight;
}

function chonHoiVien(email) {
  emailDangChon = email;
  veTinNhan();
}

document.getElementById('formTraLoi').addEventListener('submit', function (suKien) {
  suKien.preventDefault();
  const o = document.getElementById('noiDungTraLoi');
  if (!o.value.trim() || !emailDangChon) return;
  const tin = layDuLieu('tinNhan');
  tin.push({ email: emailDangChon, tu: 'quanly', noiDung: o.value.trim(), thoiGian: Date.now() });
  luuDuLieu('tinNhan', tin);
  o.value = '';
  veTinNhan();
});

function veTatCa() {
  veSoLieu();
  veBangDangKy();
  veBangHoiVien();
  veTinNhan();
}

if (quanLy && quanLy.vaiTro === 'quanly') veTatCa();
