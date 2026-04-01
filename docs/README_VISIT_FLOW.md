# README_VISIT_FLOW

Tài liệu ngắn mô tả luồng `Visit Access` (đăng ký ra/vào cổng) để thành viên mới có thể nắm nhanh kiến trúc backend.

## 1. Mục tiêu nghiệp vụ

- Chuẩn hóa quy trình: `Requester -> Approver -> Security`.
- Theo dõi đầy đủ vòng đời yêu cầu từ tạo phiếu đến check-out.
- Đảm bảo có dữ liệu audit cho các trường hợp ngoại lệ tại cổng.

## 2. Thành phần chính

- Model: `backend/src/models/VisitRequest.js`
- Model bổ sung:
  - `backend/src/models/AccessPolicyEntry.js` (blacklist/whitelist)
  - `backend/src/models/AuditLog.js` (truy vết nghiệp vụ)
- Controller:
  - `backend/src/controllers/visitController.js`
  - `backend/src/controllers/reportController.js`
- Routes:
  - `backend/src/routes/visitRoutes.js`
  - `backend/src/routes/approvalRoutes.js`
  - `backend/src/routes/gateRoutes.js`
  - `backend/src/routes/reportRoutes.js`
- Route đăng ký ở server: `backend/src/server.js`

## 3. State Machine (trạng thái)

Các trạng thái chính của `VisitRequest`:

- `PENDING_APPROVAL`: vừa tạo, đang chờ duyệt.
- `APPROVED`: đã duyệt, có thể check-in.
- `REJECTED`: bị từ chối, có `rejectionReason`.
- `CHECKED_IN`: đã vào cổng.
- `OVERDUE`: quá thời gian dự kiến nhưng chưa check-out.
- `CHECKED_OUT`: đã rời cổng.
- `CANCELLED`: yêu cầu bị hủy.

Luồng thường gặp:

1. `PENDING_APPROVAL -> APPROVED -> CHECKED_IN -> CHECKED_OUT`
2. `PENDING_APPROVAL -> REJECTED`
3. `PENDING_APPROVAL -> CANCELLED`

Phân loại đối tượng (`subjectType`):

- `EMPLOYEE`
- `GUEST`
- `CONTRACTOR`
- `VEHICLE`

## 4. Phân quyền nhanh

- `user`:
  - Tạo yêu cầu mới.
  - Xem yêu cầu của chính mình.
  - Hủy yêu cầu (nếu chưa đi vào bước vận hành cổng).
- `moderator` / `admin`:
  - Xem toàn bộ yêu cầu.
  - Duyệt hoặc từ chối.
  - Thao tác nghiệp vụ tại cổng (verify/check-in/check-out/manual-deny).
- `admin`:
  - Quản trị policy chặn/cho phép theo ID/SĐT/biển số.

## 5. API theo nhóm

### 5.1 Requester APIs (`/api/visits`)

- `GET /api/visits`: danh sách yêu cầu.
- `POST /api/visits`: tạo yêu cầu.
- `POST /api/visits/:id/cancel`: hủy yêu cầu.

### 5.2 Approver APIs (`/api/approvals`)

- `GET /api/approvals/inbox`: danh sách chờ duyệt.
- `POST /api/approvals/:requestId/approve`: duyệt yêu cầu.
- `POST /api/approvals/:requestId/reject`: từ chối yêu cầu.

### 5.3 Security APIs (`/api/gate`)

- `POST /api/gate/verify-qr`: xác minh mã tại cổng.
- `POST /api/gate/check-in`: ghi nhận vào cổng.
- `POST /api/gate/check-out`: ghi nhận ra cổng.
- `POST /api/gate/manual-deny`: ghi nhận từ chối thủ công (ngoại lệ).

### 5.4 Report APIs (`/api/reports`)

- `GET /api/reports/realtime`: KPI realtime + hoạt động gần nhất.
- `GET /api/reports/daily?from=YYYY-MM-DD&to=YYYY-MM-DD`: thống kê theo ngày.
- `GET /api/reports/overdue`: danh sách hồ sơ quá giờ.
- `GET /api/reports/export?type=excel|csv&from=YYYY-MM-DD&to=YYYY-MM-DD`: tải file báo cáo.

### 5.5 Access Policy APIs (`/api/access-control`)

- `GET /api/access-control/policies`: xem danh sách policy.
- `POST /api/access-control/policies`: thêm/cập nhật policy.
- `PATCH /api/access-control/policies/:id/toggle`: bật/tắt policy.

## 6. Field quan trọng trong model

- `requestCode`: mã nghiệp vụ (vd: `REQ-20260308-1234`).
- `status`: trạng thái hiện tại của hồ sơ.
- `qrToken`, `qrExpiresAt`: dùng cho xác minh tại cổng.
- `approvedBy`, `approvedAt`: dấu vết phê duyệt.
- `rejectedBy`, `rejectedAt`, `rejectionReason`: dấu vết từ chối.
- `checkInAt`, `checkOutAt`: thời gian thực tế ra/vào.
- `deniedLogs[]`: nhật ký từ chối thủ công phục vụ audit.
- `subjectType`: loại đối tượng ra/vào.
- `safetyChecklistCompleted`, `safetyChecklistNote`: checklist an toàn cho nhà thầu.

## 7. Quy tắc nghiệp vụ chính

- Không cho check-in nếu chưa `APPROVED`.
- Không cho check-out nếu chưa `CHECKED_IN` (hoặc `OVERDUE`).
- Mã QR hết hạn sẽ bị chặn.
- Từ chối phê duyệt bắt buộc có lý do.
- Manual deny phải lưu log để truy vết.
- Check-in/check-out đã xử lý idempotent (gọi lặp cùng trạng thái sẽ trả thành công và dữ liệu hiện tại).
- Nhà thầu (`CONTRACTOR`) bắt buộc hoàn thành checklist an toàn trước duyệt.
- Blacklist/whitelist được kiểm tra khi tạo hồ sơ và tại cổng (verify/check-in).
- Các thao tác chính đã ghi `AuditLog` để truy vết.

## 8. Hướng dẫn debug nhanh

1. Kiểm tra token và role trong middleware `verifyToken`.
2. Kiểm tra trạng thái hiện tại của hồ sơ trước khi gọi API chuyển trạng thái.
3. Kiểm tra dữ liệu `requestCode`, `qrToken`, `idNumber` khi verify.
4. Nếu lỗi role `403`, xác nhận tài khoản là `moderator` hoặc `admin`.
5. Nếu lỗi `404`, kiểm tra ObjectId hoặc mã nhập tại cổng.

## 9. Integration test trước deploy

- Script: `backend/scripts/test-access-flow.js`
- Lệnh chạy: `npm run test:accessflow --prefix backend`
- Mục tiêu kiểm thử:
  - Tạo request -> approve -> verify -> check-in/check-out (bao gồm idempotent)
  - Kiểm tra realtime/daily/overdue report
  - Kiểm tra export csv/excel
- Điều kiện chạy: backend API đang chạy tại `http://127.0.0.1:5001` (hoặc đặt `TEST_API_BASE_URL`)

## 10. Gợi ý cải tiến tiếp theo

- Tách service layer khỏi controller khi nghiệp vụ mở rộng.
- Bổ sung endpoint report export nâng cao (nhiều sheet, filter theo department/host).
