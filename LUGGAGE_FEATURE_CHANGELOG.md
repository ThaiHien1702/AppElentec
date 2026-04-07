# Tính Năng Mới: Quản Lý Hành Lý/Vật Dụng Khách Tại Cổng

## Tóm Tắt

Đã thêm hoàn toàn tính năng quản lý hành lý/vật dụng mà khách mang vào/ra cổng. Tính năng này cho phép:

✅ **Ghi nhận vật dụng** - Thêm thông tin hành lý khi khách check-in  
✅ **Theo dõi** - Ghi nhận các vật dụng mang vào/ra cổng  
✅ **Quản lý trạng thái** - Đánh dấu khi mất, hư, trả lại  
✅ **Chụp ảnh** - Lưu bằng chứng visual (check-in/check-out)  
✅ **Audit trail** - Ghi nhận tất cả thao tác trong AuditLog  
✅ **Tracking code** - Mã định danh duy nhất cho mỗi vật dụng  
✅ **Thống kê** - Lấy báo cáo về số lượng và giá trị hành lý

---

## Files Đã Tạo/Sửa Đổi

### New Files (Tệp Mới)

```
backend/src/models/Luggage.js                    # Model hành lý
backend/src/controllers/luggageController.js     # Logic quản lý hành lý
backend/src/routes/luggageRoutes.js              # API routes
backend/luggage.http                             # Test requests (REST Client)
LUGGAGE_API_DOCUMENTATION.md                     # Tài liệu API chi tiết
```

### Modified Files (Tệp Đã Sửa)

```
backend/src/server.js                            # Thêm route luggage
backend/src/controllers/visitController.js       # Thêm getVisitDetail()
backend/src/routes/visitRoutes.js                # Thêm route GET /:id
```

---

## Models & Database

### Luggage Schema

```javascript
{
  visitRequest: ObjectId,           // Liên kết với VisitRequest
  itemName: String (required),      // Tên vật dụng
  description: String,              // Mô tả chi tiết
  quantity: Number,                 // Số lượng (mặc định: 1)
  itemType: Enum,                   // PERSONAL_ITEM, LUGGAGE, VEHICLE, EQUIPMENT, OTHER
  estimatedValue: Number,           // Giá trị ước tính
  status: Enum,                     // CHECKED_IN, CHECKED_OUT, LOST, DAMAGED, RETURNED
  checkedInBy: ObjectId (User),     // Người ghi nhận check-in
  checkedInAt: Date,                // Thời gian check-in
  checkedOutBy: ObjectId (User),    // Người ghi nhận check-out
  checkedOutAt: Date,               // Thời gian check-out
  itemImageData: String,            // Ảnh vật dụng (base64)
  returnImageData: String,          // Ảnh khi trả lại (base64)
  trackingCode: String (unique),    // Mã tracking LUG-YYYYMMDD-XXXXX
  notes: String,                    // Ghi chú
  createdAt, updatedAt              // Timestamps
}
```

---

## API Endpoints

### 1️⃣ POST `/api/luggage` - Thêm Hành Lý

**Yêu cầu:**

```json
{
  "visitRequestId": "ObjectId",
  "itemName": "Ba lô xanh",
  "description": "Ba lô nylon, màu xanh",
  "quantity": 1,
  "itemType": "LUGGAGE",
  "estimatedValue": 500000,
  "itemImageData": "data:image/jpeg;base64,..."
}
```

### 2️⃣ GET `/api/luggage/visit/:visitRequestId` - Lấy Danh Sách Hành Lý

Lấy tất cả vật dụng của một yêu cầu ra/vào.

### 3️⃣ PATCH `/api/luggage/:luggageId/checkout` - Check-out Hành Lý

Ghi nhận khi khách mang vật dụng ra.

### 4️⃣ PATCH `/api/luggage/:luggageId/status` - Cập Nhật Trạng Thái

Đánh dấu LOST, DAMAGED, hoặc RETURNED.

### 5️⃣ DELETE `/api/luggage/:luggageId` - Xóa Hành Lý

Chỉ xóa được khi trạng thái là CHECKED_IN.

### 6️⃣ GET `/api/luggage` - Lấy Toàn Bộ (Có Bộ Lọc)

Query: `status`, `visitRequestId`, `itemType`, `page`, `limit`

### 7️⃣ GET `/api/luggage/stats/summary` - Thống Kê

Lấy số lượng hành lý theo trạng thái và loại.

### 8️⃣ GET `/api/visits/:id` - Chi Tiết Yêu Cầu (Với Hành Lý)

Trả về thông tin yêu cầu + danh sách hành lý.

---

## Quy Trình Sử Dụng

### Bước 1️⃣: Khách Tạo Yêu Cầu Ra/Vào

```
POST /api/visits
```

→ Nhận `visitRequestId`

### Bước 2️⃣: Hệ Thống Phê Duyệt

```
POST /api/approvals/:id/approve
```

### Bước 3️⃣: Khách Check-In Tại Cổng

```
POST /api/gate/check-in
```

Ghi nhận: thời gian, ảnh chân dung, thẻ QR

### Bước 4️⃣: Security Ghi Nhận Hành Lý

**Thêm hành lý:**

```
POST /api/luggage
{
  "visitRequestId": "...",
  "itemName": "Ba lô",
  "itemType": "LUGGAGE",
  "itemImageData": "data:image/jpeg;base64,..."
}
```

**Xem danh sách:**

```
GET /api/luggage/visit/{visitRequestId}
```

### Bước 5️⃣: Khách Check-Out Tại Cổng

**Ghi nhận check-out từng vật dụng:**

```
PATCH /api/luggage/{luggageId}/checkout
{
  "returnImageData": "data:image/jpeg;base64,...",
  "notes": "Vật dụng còn nguyên vẹn"
}
```

### Bước 6️⃣: Nếu Có Vấn Đề

**Đánh dấu mất/hư:**

```
PATCH /api/luggage/{luggageId}/status
{
  "status": "LOST",
  "notes": "Khách báo mất tại cổng"
}
```

---

## Audit & Logging

✅ Tất cả thao tác đều được ghi nhận trong **AuditLog**:

- Người thao tác (userId, userRole)
- Hành động (LUGGAGE_ADDED, LUGGAGE_CHECKED_OUT, LUGGAGE_STATUS_UPDATED, LUGGAGE_DELETED)
- Thời gian
- Metadata (tên vật dụng, trackingCode, v.v.)

### Ví Dụ Audit Log Entry:

```json
{
  "actorId": "user123",
  "actorRole": "moderator",
  "action": "LUGGAGE_ADDED",
  "entityType": "Luggage",
  "entityId": "luggage456",
  "metadata": {
    "visitRequestId": "visit789",
    "itemName": "Ba lô xanh",
    "trackingCode": "LUG-20260407-12345"
  },
  "createdAt": "2026-04-07T10:30:00Z"
}
```

---

## Quyền Hạn

| Hành Động                          | Admin | Moderator | User              |
| ---------------------------------- | ----- | --------- | ----------------- |
| Thêm hành lý                       | ✅    | ✅        | ❌                |
| Check-out hành lý                  | ✅    | ✅        | ❌                |
| Cập nhật trạng thái                | ✅    | ✅        | ❌                |
| Xóa hành lý                        | ✅    | ✅        | ❌                |
| Lấy danh sách                      | ✅    | ✅        | ❌                |
| Xem chi tiết yêu cầu (với hành lý) | ✅    | ✅        | ✅ (Riêng của họ) |

---

## Testing

### Cách Test Bằng REST Client

1. Mở file: `backend/luggage.http`
2. Cài VS Code extension: **REST Client** (`humao.rest-client`)
3. Click "Send Request" trên mỗi endpoint
4. Thay thế token và ObjectId bằng giá trị thực tế

### Test Cases

```
✅ POST /api/luggage - Thêm hành lý mới
✅ GET /api/luggage/visit/:visitId - Lấy danh sách
✅ PATCH /api/luggage/:id/checkout - Check-out
✅ PATCH /api/luggage/:id/status - Cập nhật trạng thái
✅ DELETE /api/luggage/:id - Xóa
✅ GET /api/luggage?status=CHECKED_IN - Bộ lọc
✅ GET /api/luggage/stats/summary - Thống kê
✅ GET /api/visits/:id - Chi tiết với hành lý
```

---

## Features Thêm Trong Tương Lai

🔄 **Có thể mở rộng thành:**

- Gõ text-to-speech khi thêm hành lý
- Barcode scanning cho tracking
- Real-time notification khi hành lý bị đánh dấu LOST
- Excel export danh sách hành lý
- Mobile app scan items
- Insurance claim processing (nếu mất/hư)

---

## Lưu Ý Quan Trọng

⚠️ **Quyền Hạn Enfordement:**

- Chỉ Moderator/Admin được ghi nhận hành lý
- Chỉ được thêm hành lý sau khi khách **CHECKED_IN**
- Chỉ được xóa hành lý ở trạng thái **CHECKED_IN** (mới check-in)

⚠️ **Tracking Code:**

- Tự động sinh: `LUG-YYYYMMDD-XXXXX`
- Dùng để tra cứu nhanh bằng REST:
  ```
  GET /api/luggage?trackingCode=LUG-20260407-12345
  ```

⚠️ **Hình Ảnh:**

- Lưu dưới dạng Base64 URL
- Giúp so sánh trước/sau khi check-out

---

## Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra `backend/src/models/Luggage.js` - Model có đúng không?
2. Kiểm tra `backend/src/server.js` - Route đã được thêm chưa?
3. Kiểm tra `LUGGAGE_API_DOCUMENTATION.md` - API spec chi tiết
4. Sử dụng `luggage.http` để test endpoints

---

**Created:** 2026-04-07  
**Status:** ✅ Ready for Production  
**Version:** 1.0
