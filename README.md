# Gang Thép Gym – Website quản lý phòng gym (bản đơn giản)

Bài tập lớn (nhóm 4 người) môn **Thiết kế Web**.

| Họ tên | MSSV | Phụ trách |
|---|---|---|
| Lò Anh Đức (trưởng nhóm) | 252601039 | Hàm dùng chung (dữ liệu, ngày tháng, menu), đăng nhập, giao diện điện thoại |
| Nguyễn Chí Bảo Duy | 252601027 | Trang chủ, đăng ký tài khoản |
| Quản Hoàng Nam | 252601073 | Đăng ký gói, gói của tôi |
| Bùi Hoàng Hiệp | 252601045 | Nhắn tin, trang quản lý |

Chi tiết xem file `PHAN_CONG.md`.

## Cách chạy

Mở file `index.html` bằng trình duyệt (hoặc dùng Live Server trong VS Code).

Tài khoản quản lý có sẵn: **admin@gym.vn** / **admin123**. Tài khoản hội viên thì tự tạo ở trang Đăng ký.

## Các trang

| Trang | File | Chức năng |
|---|---|---|
| Trang chủ | `index.html` | Giới thiệu, ảnh phòng tập, gói tập, huấn luyện viên, địa chỉ, hotline |
| Đăng ký | `dang-ky.html` | Tạo tài khoản: họ tên, email, số điện thoại, mật khẩu |
| Đăng nhập | `dang-nhap.html` | Đăng nhập bằng email và mật khẩu |
| Đăng ký gói | `dang-ky-goi.html` | Nhập họ tên, SĐT, địa chỉ, chọn gói, chọn ngày bắt đầu; ngày kết thúc và tổng tiền tự tính |
| Gói của tôi | `goi-cua-toi.html` | Bảng các gói đã đăng ký kèm ngày tháng năm, trạng thái; đổi gói, hủy gói |
| Nhắn tin | `tin-nhan.html` | Hội viên nhắn tin với quản lý |
| Quản lý | `quan-ly.html` | Số liệu, duyệt đăng ký gói, danh sách hội viên, trả lời tin nhắn |

## Cấu trúc thư mục

```
QuanLy PhongGym/
├── index.html, dang-ky.html, dang-nhap.html, dang-ky-goi.html,
│   goi-cua-toi.html, tin-nhan.html, quan-ly.html
├── css/style.css          Toàn bộ giao diện
├── js/
│   ├── common.js          Hàm dùng chung: danh sách gói, lưu dữ liệu, ngày tháng, menu
│   ├── trang-chu.js       Vẽ thẻ gói tập
│   ├── dang-ky.js         Kiểm tra form và tạo tài khoản
│   ├── dang-nhap.js       Kiểm tra email, mật khẩu
│   ├── dang-ky-goi.js     Đăng ký gói, đổi gói, tự tính ngày kết thúc
│   ├── goi-cua-toi.js     Bảng gói đã đăng ký, hủy gói
│   ├── tin-nhan.js        Nhắn tin với quản lý
│   └── quan-ly.js         Trang quản lý
└── images/                Ảnh phòng tập và huấn luyện viên (ảnh minh họa)
```

## Dữ liệu

Dữ liệu lưu trong **LocalStorage** của trình duyệt, gồm 4 khóa:

- `taiKhoan`: danh sách tài khoản (`hoTen, email, sdt, matKhau, vaiTro`)
- `nguoiDangNhap`: tài khoản đang đăng nhập
- `dangKyGoi`: danh sách đăng ký gói (`hoTen, sdt, diaChi, maGoi, ngayBatDau, ngayKetThuc, soTien, trangThai`)
- `tinNhan`: tin nhắn giữa hội viên và quản lý

Trạng thái gói: **Chờ duyệt** → (quản lý duyệt) → **Chưa bắt đầu / Đang tập / Hết hạn**, hoặc **Đã hủy**, **Đã đổi gói**.

> Ghi chú: để đơn giản, mật khẩu được lưu nguyên văn trong LocalStorage. Website thật cần lưu mật khẩu đã mã hóa ở máy chủ.
> [Xem chi tiết phân công công việc tại đây](./PHAN_CONG.md)
