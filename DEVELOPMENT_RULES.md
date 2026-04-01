# Quy Tắc Bắt Buộc Khi Làm Tính Năng Mới/Mở Rộng

Áp dụng cho toàn bộ team khi phát triển dự án Elentec.
Mục tiêu: giảm lỗi production, đồng bộ cách làm, tăng tốc onboarding.

## 1. Quy tắc bắt buộc trước khi code

1. Phải có mô tả yêu cầu rõ ràng (input, output, role nào dùng).
2. Phải xác định phạm vi thay đổi: `backend`, `frontend`, hoặc cả hai.
3. Phải liệt kê trạng thái nghiệp vụ bị ảnh hưởng (ví dụ: `PENDING_APPROVAL -> APPROVED`).
4. Phải xác định rủi ro bảo mật nếu có dữ liệu nhạy cảm.
5. Không bắt đầu code nếu chưa rõ tiêu chí hoàn thành (acceptance criteria).

## 2. Quy tắc bắt buộc khi thiết kế API/backend

1. Mỗi endpoint mới phải có kiểm tra quyền (`verifyToken` + middleware role phù hợp).
2. Mọi input phải validate đầy đủ và trả lỗi rõ ràng (`400/403/404/500`).
3. Không bỏ qua state machine: chỉ cho phép chuyển trạng thái hợp lệ.
4. Mọi thao tác nhạy cảm phải có dấu vết audit/log tối thiểu (`approvedBy`, `rejectedBy`, thời gian...).
5. Không hard-code dữ liệu bí mật trong source code.
6. Route/controller/model mới phải có chú thích tiếng Việt ngắn gọn ở các khối logic chính.

## 3. Quy tắc bắt buộc khi làm frontend

1. Không gọi API trực tiếp bằng URL cứng, phải dùng `API_PATHS`.
2. Mọi thao tác API phải có xử lý lỗi thống nhất bằng `handleApiError`.
3. Màn hình thao tác nghiệp vụ phải có trạng thái `loading`, `empty`, `error`.
4. Nút thao tác quan trọng (approve/reject/check-in/out) phải có điều kiện enable/disable đúng trạng thái.
5. Form bắt buộc phải validate client-side trước khi submit.
6. Component mới phải có chú thích tiếng Việt cho các phần state/hàm quan trọng.

## 4. Quy tắc bắt buộc về dữ liệu và migration

1. Khi thêm field model, phải đảm bảo tương thích dữ liệu cũ.
2. Không đổi tên field đang dùng ở frontend nếu chưa cập nhật toàn bộ API consumer.
3. Mọi thay đổi schema phải cập nhật tài liệu flow tương ứng.
4. Nếu thêm enum trạng thái mới, phải cập nhật:

- Backend validation
- Frontend mapping hiển thị
- Báo cáo liên quan

## 5. Quy tắc bắt buộc về bảo mật

1. Không log token/password/PII ra console production.
2. Endpoint nghiệp vụ nội bộ phải giới hạn đúng role.
3. Dữ liệu nhạy cảm phải được kiểm soát truy cập theo nguyên tắc "need-to-know".
4. Không merge code nếu còn đường bypass quyền tạm thời.

## 6. Quy tắc bắt buộc về review và merge

1. Mỗi tính năng phải có tự review trước khi tạo PR.
2. PR phải mô tả rõ:

- Vấn đề
- Giải pháp
- Files thay đổi
- Cách test

3. Không merge khi còn lỗi compile/lint trong file đã sửa.
4. Không merge nếu chưa test luồng chính end-to-end.
5. Không sửa file ngoài phạm vi nếu không có lý do rõ ràng.

## 7. Definition of Done (bắt buộc)

Một tính năng chỉ được coi là hoàn thành khi đạt đủ:

- [ ] Đúng yêu cầu nghiệp vụ và role sử dụng
- [ ] API/DB/UI nhất quán dữ liệu
- [ ] Kiểm tra quyền và validate input đầy đủ
- [ ] Có xử lý lỗi và thông báo dễ hiểu
- [ ] Có chú thích tiếng Việt ở các khối khó
- [ ] Build frontend pass
- [ ] Không có errors trong các file đã sửa
- [ ] Có cập nhật tài liệu liên quan (`README`, flow docs, SOP nếu cần)

## 8. Quy tắc xử lý hotfix production

1. Hotfix chỉ sửa phần gây lỗi, không refactor lớn.
2. Phải có mô tả nguyên nhân gốc (root cause) sau khi fix.
3. Phải bổ sung guard để tránh lặp lại lỗi tương tự.
4. Cập nhật lại tài liệu/quy tắc nếu phát hiện lỗ hổng quy trình.

## 9. Cam kết team

- Tất cả thành viên tuân thủ tài liệu này khi làm feature mới hoặc mở rộng.
- Nếu cần ngoại lệ, phải được thống nhất trước trong team và ghi rõ trong PR.
