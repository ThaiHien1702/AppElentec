# FM-05: Báo Cáo Sự Cố An Ninh

Mã biểu mẫu: FM-05  
Phiên bản: 1.0  
Ngày áp dụng: 08/03/2026  
Bộ phận quản lý: An ninh doanh nghiệp

## 1. Thông tin sự cố

- Mã sự cố: `INC-20260308-002`
- Thời điểm xảy ra: `08/03/2026 19:05`
- Địa điểm: `Cổng phụ`
- Người phát hiện: `Ngô An Ninh`
- Mức độ sự cố: `Mức 2 - Trung bình`

## 2. Mô tả sự cố

- Sự việc: `Một khách cố dùng QR đã hết hạn để vào lại cổng lần 2.`
- Mã hồ sơ liên quan: `REQ-20260308-015`
- Dấu hiệu rủi ro: `Có hành vi tranh luận, cố yêu cầu bỏ qua quy trình.`

## 3. Xử lý ban đầu

1. Security từ chối check-in theo đúng SOP.
2. Mời khách vào khu vực chờ, tránh ùn tắc cổng.
3. Liên hệ người phụ trách nội bộ xác minh nhu cầu vào lại.
4. Gửi thông tin cho Approver để ra quyết định mới.

## 4. Quyết định xử lý

- Quyết định cuối: `Không cho vào lại trong ngày`
- Người ra quyết định: `Phạm Quản Lý`
- Thời điểm quyết định: `08/03/2026 19:12`
- Căn cứ: `QR hết hạn, không có yêu cầu bổ sung hợp lệ trên hệ thống`

## 5. Ảnh hưởng và khắc phục

- Ảnh hưởng vận hành: `Nhẹ, chậm luồng cổng khoảng 3 phút`
- Ảnh hưởng an ninh: `Không phát sinh xâm nhập`
- Biện pháp khắc phục ngay: `Nhắc nhở quy định, hướng dẫn tạo yêu cầu mới`
- Biện pháp phòng ngừa: `Bổ sung tin nhắn nhắc hết hạn QR trước 30 phút`

## 6. Bài học kinh nghiệm

- Cần truyền thông rõ quy định QR một lần/hết hạn.
- Cần hiển thị cảnh báo trực quan hơn trên màn hình check-in.

## 7. Xác nhận và đóng sự cố

- Người lập biên bản: `Ngô An Ninh`
- Trưởng bộ phận an ninh: `Vũ Đội Trưởng`
- Thời điểm đóng sự cố: `08/03/2026 19:30`
