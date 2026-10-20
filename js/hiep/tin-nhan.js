const nguoi = batBuocDangNhap();
const khungTin = document.getElementById('danhSachTin');

function gioPhut(thoiGian) {
  const d = new Date(thoiGian);
  const gio = String(d.getHours()).padStart(2, '0');
  const phut = String(d.getMinutes()).padStart(2, '0');
  return `${gio}:${phut} ${d.getDate()}/${d.getMonth() + 1}`;
}

function veTinNhan() {
  const tinCuaToi = layDuLieu('tinNhan').filter(function (t) {
    return t.email === nguoi.email;
  });

  if (tinCuaToi.length === 0) {
    khungTin.innerHTML = '<p class="trong">Hãy gửi câu hỏi đầu tiên cho quản lý.</p>';
    return;
  }
  khungTin.innerHTML = '';
  tinCuaToi.forEach(function (t) {
    const lop = t.tu === 'hoivien' ? 'tin cua-toi' : 'tin';
    khungTin.innerHTML += `<div class="${lop}">${anToan(t.noiDung)}<small>${gioPhut(t.thoiGian)}</small></div>`;
  });
  khungTin.scrollTop = khungTin.scrollHeight;
}

document.getElementById('formGuiTin').addEventListener('submit', function (suKien) {
  suKien.preventDefault();
  const o = document.getElementById('noiDungTin');
  const noiDung = o.value.trim();
  if (!noiDung) return;

  const danhSach = layDuLieu('tinNhan');
  danhSach.push({ email: nguoi.email, tu: 'hoivien', noiDung: noiDung, thoiGian: Date.now() });

  luuDuLieu('tinNhan', danhSach);
  o.value = '';
  veTinNhan();
});

if (nguoi) veTinNhan();
