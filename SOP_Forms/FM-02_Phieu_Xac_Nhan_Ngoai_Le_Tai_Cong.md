# FM-02: Phiếu Xác Nhận Ngoại Lệ Tại Cổng

Mã biểu mẫu: FM-02  
Phiên bản: 1.0  
Ngày áp dụng: 08/03/2026  
Bộ phận quản lý: An ninh cổng

## 1. Thông tin ngoại lệ

- Mã ngoại lệ: `EX-20260308-007`
- Thời điểm phát sinh: `08/03/2026 14:12`
- Cổng: `Cổng chính`
- Nhân viên Security xử lý: `Trần Bảo Vệ`
- Loại ngoại lệ: `Khách không có QR`

## 2. Thông tin người vào cổng

- Họ và tên: `Phan Quốc D`
- Loại giấy tờ: `CCCD`
- Số giấy tờ: `079987654321`
- Số điện thoại: `0911222333`
- Công ty/Đơn vị: `Công ty XYZ`

## 3. Nguyên nhân ngoại lệ

- Mô tả: `Khách xác nhận đã nhận email mời nhưng không mở được mã QR tại cổng.`
- Ảnh hưởng: `Chậm check-in khoảng 7 phút.`
- Mức độ rủi ro: `Trung bình`

## 4. Bước xử lý thực hiện

1. Tra cứu theo số CCCD và số điện thoại trên hệ thống.
2. Gọi xác nhận người phụ trách nội bộ: `Lê Thị C` lúc `14:14`.
3. Yêu cầu phê duyệt khẩn từ Approver: `Phạm Quản Lý`.
4. Nhận phê duyệt `APPROVED_MANUAL` lúc `14:17`.
5. Thực hiện check-in thủ công và cấp thẻ tạm.

## 5. Kết quả xử lý

- Kết quả: `Cho phép vào có điều kiện`
- Trạng thái cuối: `CHECKED_IN`
- Mã hồ sơ liên quan: `REQ-20260308-004`
- Ghi chú bổ sung: `Đề nghị gửi lại QR dự phòng qua Zalo cho lần sau.`

## 6. Xác nhận trách nhiệm

- Security ký tên: `Trần Bảo Vệ`
- Approver xác nhận: `Phạm Quản Lý`
- Thời điểm hoàn tất: `08/03/2026 14:20`
