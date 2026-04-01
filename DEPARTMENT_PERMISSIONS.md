# Department (Phòng Ban) - Phân Quyền

## Quy Tắc Truy Cập

**Chỉ Admin mới có quyền quản lý Phòng Ban**

### API Endpoints

| Endpoint                             | Method | Yêu cầu      | Mô tả                                |
| ------------------------------------ | ------ | ------------ | ------------------------------------ |
| `/api/departments`                   | GET    | `Admin only` | Lấy danh sách tất cả departments     |
| `/api/departments/:id`               | GET    | `Admin only` | Lấy chi tiết department              |
| `/api/departments/:id/users`         | GET    | `Admin only` | Lấy danh sách users trong department |
| `/api/departments`                   | POST   | `Admin only` | Tạo department mới                   |
| `/api/departments/:id`               | PUT    | `Admin only` | Cập nhật department                  |
| `/api/departments/:id`               | DELETE | `Admin only` | Xóa department                       |
| `/api/departments/:id/toggle-status` | PATCH  | `Admin only` | Bật/tắt department                   |
| `/api/departments/:id/users/add`     | POST   | `Admin only` | Thêm user vào department             |
| `/api/departments/:id/users/remove`  | POST   | `Admin only` | Xóa user khỏi department             |

### Frontend Routes

- `/departments` - Chỉ admin có thể truy cập
  - Non-admin sẽ thấy message: "Chỉ admin mới có quyền quản lý phòng ban"

### HTTP Status Codes

- `200` - Thành công
- `201` - Tạo mới thành công
- `400` - Bad request (dữ liệu không hợp lệ)
- `401` - Không có token hoặc token không hợp lệ
- `403` - Forbidden (user không phải admin)
- `404` - Department hoặc user không tồn tại
- `409` - Conflict (tên department đã tồn tại, user đã có trong department)
- `500` - Lỗi server

## Features

### admin Có Thể:

✅ Xem tất cả departments  
✅ Xem chi tiết mỗi department  
✅ Tạo department mới  
✅ Chỉnh sửa tên, mô tả, trạng thái  
✅ Xóa department  
✅ Bật/tắt department  
✅ Xem danh sách users trong department  
✅ Thêm users vào department  
✅ Xóa users khỏi department

### Non-admin Users:

❌ Không thể xem departments  
❌ Không thể quản lý users trong departments  
❌ Không thể truy cập `/departments` page

## Cách Sử Dụng

### Admin quản lý Phòng Ban

1. **Truy cập trang Quản lý Phòng Ban**
   - Chuyển đến `/departments` (chỉ admin)

2. **Xem danh sách departments**
   - Bảng hiển thị tất cả departments với tên, mô tả, trạng thái

3. **Tạo department mới**
   - Click nút "Thêm phòng ban"
   - Nhập tên (bắt buộc), mô tả (tùy chọn)
   - Chọn trạng thái (active/inactive)
   - Click "Tạo mới"

4. **Chỉnh sửa department**
   - Click icon ✏️ (Pencil)
   - Thay đổi thông tin
   - Click "Cập nhật"

5. **Quản lý users trong department**
   - Click icon 👥 (Users)
   - Modal mở ra với 2 phần:
     - **Thêm user:** Select user từ dropdown + Click "Thêm"
     - **Danh sách hiện tại:** Hiển thị users, có nút ❌ để xóa

6. **Bật/tắt department**
   - Click icon ⚡ (Power)
   - Department tự động chuyển trạng thái

7. **Xóa department**
   - Click icon 🗑️ (Trash)
   - Confirm xóa

## Implementation Details

### Backend Changes

- Tất cả GET/POST/PUT/DELETE route `/api/departments` đều require `isAdmin` middleware
- Non-admin requests sẽ nhận 403 Forbidden

### Frontend Changes

- DepartmentPage check `user.role === "admin"`
- Non-admin sẽ thấy page trắng với message "Truy cập bị từ chối"
- Nút tạo/chỉnh sửa/xóa chỉ hiển thị khi `isAdmin = true`

### Data Flow

```
User Login → system kiểm tra role
   ↓
Admin → có quyền truy cập /departments
   ↓
GET /api/departments (with token + isAdmin check)
   ↓
Fetch danh sách departments từ DB
   ↓
Render bảng + modal quản

Non-admin → Block ở frontend + 403 ở backend nếu cố gọi API
```
