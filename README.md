# Gang Thép Gym – Website quản lý phòng gym

Bài tập lớn (nhóm 4 người) môn **Thiết kế Web**. Website giới thiệu phòng tập, cho phép khách đăng ký tài khoản, đăng ký/đổi/gia hạn/hủy gói tập, nhắn tin với quản lý; quản lý có trang riêng để duyệt thanh toán, quản lý hội viên, trả lời tin nhắn và chỉnh giá gói.

## Thành viên nhóm

| Họ tên | Phụ trách |
|---|---|
| Lò Anh Đức (trưởng nhóm) | Khung giao diện, hiệu ứng, điều hướng, ghép code |
| Nguyễn Chí Bảo Duy | Trang chủ giới thiệu |
| Quản Hoàng Nam | Đăng ký, đăng nhập, tài khoản & gói tập |
| Bùi Hoàng Hiệp | Dữ liệu, trang quản trị, nhắn tin |

## Chạy thử

Không cần cài đặt. Mở file `index.html` bằng Chrome, Edge hoặc Firefox.

Tài khoản dùng thử (có sẵn trong dữ liệu mẫu):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Hội viên | member@gangthep.vn | 123456 |
| Quản lý | admin@gangthep.vn | admin123 |

> Mẹo khi thuyết trình: mở 2 tab, một tab đăng nhập hội viên, một tab đăng nhập quản lý. Tin nhắn và trạng thái gói được đồng bộ giữa hai tab ngay lập tức.

## Chức năng

**Khách (chưa đăng nhập)**
- Màn hình chào động: thanh đòn được lắp từng đĩa tạ
- Popup quảng cáo khai trương có đồng hồ đếm ngược, thanh thông báo chạy chữ
- Thư viện ảnh không gian tập luyện, bấm để xem lớn (chuyển ảnh bằng phím ← →)
- Giới thiệu phòng tập, cơ sở vật chất, đội ngũ huấn luyện viên, lịch lớp trong tuần
- Bảng giá 4 gói theo màu đĩa tạ thi đấu (10 kg xanh lá, 15 kg vàng, 20 kg xanh dương, 25 kg đỏ)
- Liên hệ: địa chỉ, chỉ đường Google Maps, hotline (gọi ngay / sao chép), email, giờ mở cửa
- Form để lại lời nhắn (kiểm tra dữ liệu đầu vào)

**Hội viên**
- Đăng ký tài khoản (kiểm tra email, số điện thoại, độ mạnh mật khẩu), đăng nhập, đăng xuất
- Nhận vé tập thử 3 ngày miễn phí
- Xem gói đang dùng: ngày bắt đầu, hết hạn, số ngày còn lại
- Đăng ký gói mới, **đổi sang gói khác** (tự trừ giá trị còn lại của gói cũ), gia hạn, hủy gói
- Xem lịch sử các gói đã đăng ký
- Sửa thông tin cá nhân, đổi mật khẩu
- Nhắn tin với quản lý (có trả lời tự động ngoài giờ)

**Quản lý**
- Tổng quan: số hội viên, gói đang hoạt động, doanh thu tháng, yêu cầu chờ duyệt, tin chưa đọc
- Duyệt yêu cầu đăng ký/đổi gói/gia hạn sau khi nhận thanh toán, hoặc từ chối kèm lý do
- Danh sách hội viên: tìm kiếm, nhắn tin, xoá
- Hộp thư trả lời hội viên
- Xem lời nhắn từ form liên hệ
- Sửa tên, thời hạn, giá và quyền lợi của gói tập

## Cấu trúc thư mục

```
QuanLy PhongGym/
├── index.html        Cấu trúc trang (HTML5 ngữ nghĩa)
├── css/
│   ├── base.css      Biến màu, nền tảng, header, footer, form, modal   (Đức)
│   ├── effects.css   Màn hình chào, quảng cáo, xem ảnh phóng to          (Đức)
│   ├── home.css      Trang chủ                                          (Duy)
│   ├── account.css   Đăng nhập, đăng ký, tài khoản                      (Nam)
│   └── admin.css     Quản trị, chat                                     (Hiệp)
├── js/
│   ├── core.js       Cấu hình, tiện ích, modal, đăng ký sự kiện         (Đức)
│   ├── data.js       Cơ sở dữ liệu, nghiệp vụ gói tập                   (Hiệp)
│   ├── effects.js    Hiệu ứng động                                      (Đức)
│   ├── home.js       Trang chủ, form liên hệ                            (Duy)
│   ├── auth.js       Đăng nhập, đăng ký                                 (Nam)
│   ├── member.js     Tài khoản, gói đã đăng ký, đổi gói                 (Nam)
│   ├── admin.js      Trang quản trị                                     (Hiệp)
│   ├── chat.js       Nhắn tin với quản lý                               (Hiệp)
│   └── main.js       Điều hướng, lắng nghe sự kiện, khởi động           (Đức)
├── images/           Ảnh phòng tập và huấn luyện viên
├── PHAN_CONG.md      Bảng phân công 4 thành viên
└── README.md
```

Chi tiết ai làm phần nào xem file **PHAN_CONG.md**.

## Kỹ thuật sử dụng

- **HTML5, CSS3, JavaScript thuần** (không dùng thư viện)
- **CSS Variables** cho hệ màu, tự đổi theo chế độ sáng/tối của máy hoặc nút chuyển
- **Responsive** bằng CSS Grid, Flexbox và media query (máy tính, máy tính bảng, điện thoại)
- **CSS Animation**: màn hình chào, chữ trượt lên, đĩa tạ xoay, chạy chữ, hiệu ứng hover
- **SPA router** bằng `location.hash` (#login, #register, #account, #admin)
- **localStorage** làm nơi lưu dữ liệu; sự kiện `storage` để đồng bộ giữa các tab
- Mật khẩu được băm **SHA-256** bằng Web Crypto API trước khi lưu
- **Event delegation**: một bộ lắng nghe sự kiện cho toàn trang qua thuộc tính `data-action`; mỗi module tự đăng ký hành động bằng `onAction()`

## Ghi chú về hình ảnh

Ảnh trong thư mục `images/` là ảnh minh họa sưu tầm từ Internet, chỉ dùng cho mục đích học tập.

## Giới hạn

Dữ liệu được lưu trong trình duyệt (localStorage), nên mỗi máy có dữ liệu riêng. Để nhiều người dùng chung một cơ sở dữ liệu thật cần thêm backend (ví dụ Firebase, Node.js + MongoDB, hoặc PHP + MySQL). Bấm "Khôi phục dữ liệu mẫu" ở cuối trang để quay về dữ liệu ban đầu.

## Đưa lên mạng

- **Netlify Drop**: vào app.netlify.com/drop, kéo thả cả thư mục `QuanLy PhongGym`.
- **GitHub Pages**: tải toàn bộ thư mục lên một repository public, vào Settings → Pages, chọn nhánh `main`.
- ## Phân công công việc
👉 [Bấm vào đây để xem chi tiết Phân Công Công Việc](./PHAN_CONG.md)
