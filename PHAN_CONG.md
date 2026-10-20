# Phân công nhóm – Website Gang Thép Gym

**Thành viên:** Lò Anh Đức (trưởng nhóm) · Nguyễn Chí Bảo Duy · Quản Hoàng Nam · Bùi Hoàng Hiệp

Website được chia thành **4 phần theo chức năng**. Mỗi thành viên sở hữu riêng các file HTML / CSS / JavaScript của phần mình, nên 4 người có thể làm song song mà không sửa chồng lên file của nhau.

## Tổng quan

| | Lò Anh Đức | Nguyễn Chí Bảo Duy | Quản Hoàng Nam | Bùi Hoàng Hiệp |
|---|---|---|---|---|
| **Vai trò** | Trưởng nhóm, khung giao diện & hiệu ứng | Trang chủ giới thiệu | Tài khoản & gói tập của hội viên | Dữ liệu, quản trị & nhắn tin |
| **HTML** | Màn hình chào, thanh chạy chữ, header, footer (`index.html`) | Toàn bộ `<main id="view-home">` (`index.html`) | Trang đăng nhập, đăng ký, tài khoản (vẽ bằng JS) | Trang quản trị, khung chat (vẽ bằng JS) |
| **CSS** | `css/base.css`, `css/effects.css` | `css/home.css` | `css/account.css` | `css/admin.css` |
| **JavaScript** | `js/core.js`, `js/main.js`, `js/effects.js` | `js/home.js` | `js/auth.js`, `js/member.js` | `js/data.js`, `js/admin.js`, `js/chat.js` |
| **Khối lượng** | ~360 dòng CSS, ~380 dòng JS, khung HTML | ~170 dòng HTML, ~200 dòng CSS, ~75 dòng JS | ~60 dòng CSS, ~360 dòng JS | ~100 dòng CSS, ~400 dòng JS |

Nguyễn Chí Bảo Duy viết ít JavaScript hơn nhưng phụ trách phần HTML lớn nhất và phần giao diện được chấm nhiều nhất (trang chủ).

---

## Lò Anh Đức – Trưởng nhóm: khung giao diện & hiệu ứng

**Chức năng**
- Hệ màu (biến CSS), font chữ, nút bấm, ô nhập, modal, thông báo (toast), header, footer
- Chế độ sáng / tối, menu trên điện thoại, responsive chung
- Màn hình chào: thanh đòn được lắp từng đĩa tạ
- Thanh thông báo chạy chữ, popup quảng cáo khai trương có đồng hồ đếm ngược
- Xem ảnh phóng to (lightbox), hiệu ứng đếm số ở phần đầu trang
- Điều hướng giữa các trang bằng `#hash` (router), khởi động ứng dụng
- Ghép code của cả nhóm (`main.js` nạp cuối cùng)

**File:** `css/base.css`, `css/effects.css`, `js/core.js`, `js/main.js`, `js/effects.js`, phần header/footer/splash trong `index.html`

**Kiến thức cần nắm để trả lời giảng viên**
- CSS Variables và cách đổi màu theo `prefers-color-scheme` / `data-theme`
- `@keyframes`, `animation-delay`, `transform`, `prefers-reduced-motion`
- `location.hash` và sự kiện `hashchange` để làm trang đơn (SPA)
- **Event delegation**: chỉ 1 bộ lắng nghe `click` cho cả trang, đọc `data-action` rồi gọi hàm đã đăng ký (`onAction`, `onForm`, `onInput`, `onKey` trong `core.js`)

---

## Nguyễn Chí Bảo Duy – Trang chủ giới thiệu

**Chức năng**
- Phần đầu trang (hero) có ảnh nền zoom chậm và đĩa tạ xoay
- Giới thiệu phòng tập, 4 khu cơ sở vật chất
- Thư viện ảnh "Không gian tập luyện"
- Bảng giá 4 gói theo màu đĩa tạ (có giá khuyến mãi)
- Thẻ huấn luyện viên có ảnh
- Lịch lớp nhóm trong tuần (tự đánh dấu "Hôm nay")
- Liên hệ: địa chỉ, chỉ đường Google Maps, hotline (gọi / sao chép), giờ mở cửa
- Form "Để lại lời nhắn" có kiểm tra dữ liệu

**File:** `css/home.css`, `js/home.js`, toàn bộ `<main id="view-home">` trong `index.html`, thư mục `images/`

**Kiến thức cần nắm**
- Thẻ HTML5 ngữ nghĩa: `section`, `article`, `figure`, `figcaption`, `nav`
- CSS Grid (`grid-template-columns`, `grid-row: span 2`), Flexbox, `aspect-ratio`, `object-fit`
- Media query cho máy tính / máy tính bảng / điện thoại
- Kiểm tra form bằng biểu thức chính quy (regex số điện thoại `^0\d{9}$`)
- Template string để vẽ HTML từ dữ liệu (`renderPlans`, `renderSchedule`)

---

## Quản Hoàng Nam – Tài khoản & gói tập của hội viên

**Chức năng**
- Đăng ký tài khoản: kiểm tra họ tên, email, số điện thoại, mật khẩu nhập lại, thanh đo độ mạnh mật khẩu
- Đăng nhập (bằng email hoặc số điện thoại), đăng xuất, hiện/ẩn mật khẩu
- Trang tài khoản: gói đang dùng, ngày bắt đầu / hết hạn, thanh tiến độ số ngày còn lại
- Danh sách các gói đã đăng ký (lịch sử)
- Đăng ký gói mới, **đổi sang gói khác** (trừ giá trị còn lại của gói cũ), gia hạn, hủy gói, hủy yêu cầu
- Vé tập thử 3 ngày
- Sửa thông tin cá nhân, đổi mật khẩu

**File:** `css/account.css`, `js/auth.js`, `js/member.js`

**Kiến thức cần nắm**
- Băm mật khẩu SHA-256 bằng Web Crypto API (`crypto.subtle.digest`), vì sao không lưu mật khẩu gốc
- `FormData`, `Object.fromEntries`, `async / await`
- Công thức đổi gói: *giá trị còn lại = giá gói × số ngày còn lại ÷ tổng số ngày*
- Xử lý ngày tháng với `Date` (cộng tháng, đếm ngày)

---

## Bùi Hoàng Hiệp – Dữ liệu, quản trị & nhắn tin

**Chức năng**
- Cơ sở dữ liệu lưu bằng `localStorage`, dữ liệu mẫu, đồng bộ giữa các tab
- Nghiệp vụ gói tập: giá khuyến mãi, trạng thái gói, xác nhận / từ chối yêu cầu
- Trang quản trị: thẻ số liệu (hội viên, doanh thu tháng, chờ duyệt…), cơ cấu gói
- Duyệt thanh toán, danh sách hội viên (tìm kiếm, xoá), lời nhắn liên hệ, sửa giá gói
- Khung chat hội viên ↔ quản lý, tin nhắn mẫu, trả lời tự động, hộp thư quản lý

**File:** `css/admin.css`, `js/data.js`, `js/admin.js`, `js/chat.js`

**Kiến thức cần nắm**
- `localStorage`, `JSON.stringify / JSON.parse`, sự kiện `storage` để đồng bộ 2 tab
- Mảng: `filter`, `map`, `reduce`, `sort`, `find`
- Thiết kế dữ liệu: `users`, `plans`, `subs` (gói đã đăng ký), `messages`, `contacts`
- Phân quyền đơn giản: `role: 'admin'` mới vào được `#admin`

---

## Cách các phần ghép với nhau

```
index.html
 ├─ css/base.css → home.css → account.css → admin.css → effects.css
 └─ js/core.js      ← Đức: tiện ích + onAction/onForm/onInput/onKey
    js/data.js      ← Hiệp: db, seed(), save(), nghiệp vụ gói
    js/effects.js   ← Đức
    js/home.js      ← Duy
    js/auth.js      ← Nam
    js/member.js    ← Nam
    js/admin.js     ← Hiệp
    js/chat.js      ← Hiệp
    js/main.js      ← Đức: nạp CUỐI, lắng nghe sự kiện và khởi động
```

Mỗi module tự đăng ký nút của mình, ví dụ trong `member.js`:

```js
onAction({
  'choose-plan': el => choosePlan(el.dataset.id),
  'change-plan': () => { ... }
});
```

Nhờ vậy khi thêm chức năng mới, thành viên chỉ sửa file của mình, không phải sửa `main.js`.

**Quy ước chung của nhóm**
- Màu sắc luôn dùng biến trong `base.css` (`var(--accent)`, `var(--surface)`…), không viết mã màu trực tiếp
- Tên hành động trong `data-action` viết chữ thường, nối bằng gạch ngang (`change-plan`)
- Không đổi tên hàm dùng chung (`$`, `esc`, `toast`, `modal`, `save`, `me`) khi chưa báo cả nhóm
