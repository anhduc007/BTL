const nguoi = batBuocDangNhap();
const bang = document.getElementById('bangGoiCuaToi');

function veBang() {
  const goiCuaToi = layDuLieu('dangKyGoi')
    .filter(function (dk) {
      return dk.email === nguoi.email;
    })
    .reverse();

  if (goiCuaToi.length === 0) {
    bang.innerHTML = '<tr><td colspan="8" class="trong">Bạn chưa đăng ký gói tập nào.</td></tr>';
    return;
  }

  bang.innerHTML = '';
  goiCuaToi.forEach(function (dk, viTri) {
    const trangThai = tinhTrangThai(dk);
    const conDungDuoc =
      dk.trangThai === 'cho-duyet' || (dk.trangThai === 'da-duyet' && trangThai.chu !== 'Hết hạn');
    let thaoTac = '–';
    if (conDungDuoc) {
      thaoTac = `
        <a href="dang-ky-goi.html?doi=${dk.id}" class="nut nut-nho">Đổi gói</a>
        <button class="nut nut-nho nut-xam" onclick="huyGoi(this, ${dk.id})">Hủy</button>
      `;
    }

    bang.innerHTML += `
      <tr>
        <td>${viTri + 1}</td>
        <td><b>${timGoi(dk.maGoi).ten}</b></td>
        <td>${dinhDangNgay(dk.ngayDangKy)}</td>
        <td>${dinhDangNgay(dk.ngayBatDau)}</td>
        <td>${dinhDangNgay(dk.ngayKetThuc)}</td>
        <td>${dinhDangTien(dk.soTien)}</td>
        <td><span class="nhan ${trangThai.lop}">${trangThai.chu}</span></td>
        <td>${thaoTac}</td>
      </tr>
    `;
  });
}

function huyGoi(nut, id) {
  if (nut.dataset.xacNhan !== 'roi') {
    nut.dataset.xacNhan = 'roi';
    nut.textContent = 'Bấm lần nữa để hủy';
    return;
  }
  const danhSach = layDuLieu('dangKyGoi');
  danhSach.forEach(function (dk) {
    if (dk.id === id) dk.trangThai = 'da-huy';
  });
  luuDuLieu('dangKyGoi', danhSach);
  hienThongBao('Đã hủy gói tập.');
  veBang();
}

if (nguoi) veBang();
