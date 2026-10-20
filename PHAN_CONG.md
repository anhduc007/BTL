# Phân công nhóm – Website Gang Thép Gym

**Thành viên:** Lò Anh Đức (trưởng nhóm) · Nguyễn Chí Bảo Duy · Quản Hoàng Nam · Bùi Hoàng Hiệp

## 1. Bảng phân công

| Thành viên | Phụ trách | File |
|---|---|---|
| **Lò Anh Đức** (trưởng nhóm) | Các hàm dùng chung (dữ liệu, ngày tháng, menu), trang đăng nhập, thanh menu, chân trang, giao diện điện thoại | `js/common.js`, `dang-nhap.html`, `js/dang-nhap.js`, `css/style.css` (phần chung, responsive) |
| **Nguyễn Chí Bảo Duy** | Trang chủ: giới thiệu, ảnh phòng tập, gói tập, huấn luyện viên, liên hệ; trang đăng ký tài khoản | `index.html`, `js/trang-chu.js`, `dang-ky.html`, `js/dang-ky.js`, `css/style.css` (trang chủ, form), `images/` |
| **Quản Hoàng Nam** | Đăng ký gói tập (tự tính ngày kết thúc), gói của tôi (đổi, hủy gói) | `dang-ky-goi.html`, `js/dang-ky-goi.js`, `goi-cua-toi.html`, `js/goi-cua-toi.js`, `css/style.css` (bảng, nhãn trạng thái) |
| **Bùi Hoàng Hiệp** | Nhắn tin với quản lý, trang quản lý | `tin-nhan.html`, `js/tin-nhan.js`, `quan-ly.html`, `js/quan-ly.js`, `css/style.css` (nhắn tin, quản lý) |

Mỗi người làm trọn vẹn các trang của mình (HTML + CSS + JavaScript), gồm một phần khó và một phần dễ, nên độ khó 4 phần gần bằng nhau.

## 2. Thứ tự thuyết trình (mỗi người khoảng 3–4 phút)

Thứ tự đi theo hành trình của một khách hàng.

### Lò Anh Đức – Mở đầu và phần dùng chung
1. Giới thiệu đề tài, nhóm, 7 trang của website.
2. Mở `js/common.js`, giải thích:
   - Mảng `GOI_TAP` chứa 4 gói, mọi trang dùng chung.
   - `layDuLieu()` / `luuDuLieu()`: đọc, ghi LocalStorage bằng `JSON.parse` / `JSON.stringify`.
   - `congThang()`: cộng tháng để tính ngày kết thúc.
   - `capNhatMenu()`: chưa đăng nhập thì hiện Đăng nhập/Đăng ký, đã đăng nhập thì hiện tên và Đăng xuất.
3. Thu nhỏ trình duyệt: menu chuyển thành nút ☰ nhờ `@media`.
4. Demo **đăng nhập** sai mật khẩu → báo lỗi; đúng → chuyển trang theo vai trò.

### Nguyễn Chí Bảo Duy – Trang chủ và đăng ký tài khoản
1. Cuộn trang chủ: giới thiệu, ảnh phòng tập, 4 gói tập, huấn luyện viên, liên hệ.
2. Mở `index.html`: các `section` có `id`, menu bấm `index.html#goi-tap` là cuộn tới.
3. Mở `css/style.css`: `grid-template-columns: repeat(4, 1fr)` chia 4 cột gói tập.
4. Mở `js/trang-chu.js`: `forEach` vẽ 4 thẻ gói từ mảng `GOI_TAP`.
5. Demo **đăng ký tài khoản**: nhập sai email, số điện thoại → báo lỗi dưới từng ô; nhập đúng → tạo tài khoản.

### Quản Hoàng Nam – Đăng ký gói và gói của tôi
1. Từ trang chủ bấm "Đăng ký gói này" → form chọn sẵn gói nhờ `?goi=`.
2. Demo: nhập SĐT, địa chỉ, chọn ngày bắt đầu → **ngày kết thúc và tổng tiền tự cập nhật**.
3. Mở `js/dang-ky-goi.js`: sự kiện `change` gọi `capNhatTomTat()`.
4. Trang **Gói của tôi**: bảng ngày đăng ký, ngày bắt đầu, ngày kết thúc, trạng thái "Chờ duyệt".
5. Demo **đổi gói** và **hủy gói** (bấm 2 lần mới hủy).

### Bùi Hoàng Hiệp – Nhắn tin và trang quản lý
1. Hội viên vào **Nhắn tin**, gửi câu hỏi cho quản lý.
2. Đăng nhập quản lý `admin@gym.vn / admin123`: 4 ô số liệu, bấm **Duyệt** gói đang chờ; mở tin nhắn của hội viên và trả lời.
3. Mở `js/quan-ly.js`: `filter` lọc gói chờ duyệt, cộng doanh thu gói đã duyệt, chặn người không phải quản lý.
4. Kết thúc: đăng nhập lại hội viên, gói đã chuyển sang **"Đang tập"**.

## 3. Câu hỏi giảng viên hay hỏi

| Câu hỏi | Người trả lời | Gợi ý trả lời |
|---|---|---|
| Dữ liệu lưu ở đâu? Tắt máy có mất không? | Đức | Lưu trong LocalStorage, tắt máy không mất, nhưng mỗi trình duyệt có dữ liệu riêng. Muốn dùng chung cần máy chủ và cơ sở dữ liệu. |
| Làm sao biết ai đang đăng nhập? | Đức | Khi đăng nhập đúng, lưu tài khoản vào khóa `nguoiDangNhap`; đăng xuất thì xóa khóa này. |
| Làm sao menu bấm là cuộn tới đúng mục? | Duy | Mỗi mục là một `section` có `id`, liên kết dạng `index.html#goi-tap`. |
| Kiểm tra số điện thoại thế nào? | Duy | Biểu thức `^0\d{9}$`: bắt đầu bằng 0, theo sau đúng 9 chữ số. |
| Ngày kết thúc tính thế nào? | Nam | Hàm `congThang()` tạo `new Date(năm, tháng + số tháng của gói, ngày)`. |
| Đổi gói xử lý ra sao? | Nam | Gói cũ chuyển "Đã đổi gói" (nếu đã duyệt) hoặc "Đã hủy" (nếu chưa), rồi tạo đăng ký mới chờ duyệt. |
| Hội viên vào được trang quản lý không? | Hiệp | Không. `quan-ly.js` kiểm tra `vaiTro === 'quanly'`, không phải thì chuyển về trang đăng nhập. |
| Doanh thu tính thế nào? | Hiệp | Cộng `soTien` của các đăng ký đã duyệt; gói chờ duyệt hoặc đã hủy không tính. |
