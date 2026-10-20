const danhSachGoi = document.getElementById('danhSachGoi');

GOI_TAP.forEach(function (goi) {
  let quyenLoi = '';
  goi.quyenLoi.forEach(function (q) {
    quyenLoi += `<li>${q}</li>`;
  });

  danhSachGoi.innerHTML += `
    <div class="the goi-tap" style="--mau-goi: ${goi.mau}">
      <h3>${goi.ten}</h3>
      <div class="gia">${dinhDangTien(goi.gia)}</div>
      <ul>${quyenLoi}</ul>
      <a href="dang-ky-goi.html?goi=${goi.ma}" class="nut">Đăng ký gói này</a>
    </div>
  `;
});
