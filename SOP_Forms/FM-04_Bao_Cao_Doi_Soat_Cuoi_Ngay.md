# FM-04: Báo Cáo Đối Soát Cuối Ngày

Mã biểu mẫu: FM-04  
Phiên bản: 1.0  
Ngày áp dụng: 08/03/2026  
Bộ phận thực hiện: Admin + An ninh

## 1. Thông tin báo cáo

- Ngày đối soát: `08/03/2026`
- Người lập báo cáo: `Admin Hệ Thống`
- Thời gian lập: `23:10`

## 2. Chỉ số vận hành trong ngày

- Tổng yêu cầu tạo mới: `42`
- Tổng yêu cầu được duyệt: `39`
- Tổng yêu cầu từ chối: `3`
- Tổng lượt CHECKED_IN: `38`
- Tổng lượt CHECKED_OUT: `37`
- Hồ sơ OVERDUE cuối ngày: `1`

## 3. Danh sách cần xử lý sau đối soát

| Mã hồ sơ         | Trạng thái | Vấn đề         | Người phụ trách          | Hạn xử lý        |
| ---------------- | ---------- | -------------- | ------------------------ | ---------------- |
| REQ-20260308-009 | OVERDUE    | Chưa check-out | Trưởng ca đêm            | 09/03/2026 08:00 |
| REQ-20260308-018 | REJECTED   | Thiếu CCCD     | Requester phòng Mua hàng | 09/03/2026 10:00 |

## 4. Bất thường hệ thống/phát sinh

- Có 1 lần quét QR lỗi do mạng chập chờn lúc `18:45`.
- Không ghi nhận truy cập trái phép vào tài khoản Admin.
- Audit log đầy đủ 100% cho thao tác phê duyệt và chỉnh sửa hồ sơ.

## 5. Kết luận và hành động

- Đánh giá chung: `Vận hành ổn định, có 1 hồ sơ quá giờ cần follow-up`.
- Hành động ngay:

1. Nhắc Security ca đêm liên hệ người phụ trách nội bộ để đóng hồ sơ OVERDUE.
2. Kiểm tra lại kết nối mạng tại điểm quét cổng chính.

## 6. Xác nhận

- Người lập báo cáo: `Admin Hệ Thống`
- Người duyệt báo cáo: `Quản lý An ninh`
- Thời gian xác nhận: `23:20 - 08/03/2026`
