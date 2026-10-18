# Gang Thép Gym – Website quản lý phòng gym

Bài tập lớn môn **Thiết kế Web**. Website giới thiệu phòng tập, cho phép khách đăng ký tài khoản, đăng ký/đổi/gia hạn/hủy gói tập, nhắn tin với quản lý; quản lý có trang riêng để duyệt thanh toán, quản lý hội viên, trả lời tin nhắn và chỉnh giá gói.

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
GangThepGym/
├── index.html   Cấu trúc trang (HTML5 ngữ nghĩa: header, main, section, footer)
├── style.css    Giao diện: biến màu CSS, chế độ sáng/tối, responsive, animation
├── app.js       Xử lý: router theo #hash, tài khoản, gói tập, chat, trang quản trị
├── images/      Ảnh không gian phòng tập (nền hero, thư viện ảnh, trang đăng nhập)
└── README.md
```

## Kỹ thuật sử dụng

- **HTML5, CSS3, JavaScript thuần** (không dùng thư viện)
- **CSS Variables** cho hệ màu, tự đổi theo chế độ sáng/tối của máy hoặc nút chuyển
- **Responsive** bằng CSS Grid, Flexbox và media query (máy tính, máy tính bảng, điện thoại)
- **CSS Animation**: màn hình chào, chữ trượt lên, đĩa tạ xoay, chạy chữ, hiệu ứng hover
- **SPA router** bằng `location.hash` (#login, #register, #account, #admin)
- **localStorage** làm nơi lưu dữ liệu; sự kiện `storage` để đồng bộ giữa các tab
- Mật khẩu được băm **SHA-256** bằng Web Crypto API trước khi lưu
- **Event delegation**: một bộ lắng nghe sự kiện cho toàn trang qua thuộc tính `data-action`

## Ghi chú về hình ảnh

Ảnh trong thư mục `images/` là ảnh minh họa sưu tầm từ Internet, chỉ dùng cho mục đích học tập.

## Giới hạn

Dữ liệu được lưu trong trình duyệt (localStorage), nên mỗi máy có dữ liệu riêng. Để nhiều người dùng chung một cơ sở dữ liệu thật cần thêm backend (ví dụ Firebase, Node.js + MongoDB, hoặc PHP + MySQL). Bấm "Khôi phục dữ liệu mẫu" ở cuối trang để quay về dữ liệu ban đầu.

## Đưa lên mạng

- **Netlify Drop**: vào app.netlify.com/drop, kéo thả cả thư mục `GangThepGym`.
- **GitHub Pages**: tải 3 file lên một repository public, vào Settings → Pages, chọn nhánh `main`.
