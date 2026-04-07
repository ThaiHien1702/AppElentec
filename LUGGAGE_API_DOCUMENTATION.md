## Tính Năng Quản Lý Hành Lý/Vật Dụng Khách Tại Cổng

### Giới Thiệu

Tính năng này cho phép ghi nhận, quản lý và theo dõi các hành lý/vật dụng mà khách mang vào/ra cổng. Bao gồm các thông tin như:

- Tên hành lý (ba lô, cái túi, xe máy, thiết bị, v.v.)
- Mô tả chi tiết (màu sắc, tình trạng, v.v.)
- Số lượng
- Loại vật dụng
- Giá trị ước tính
- Hình ảnh
- Trạng thái (check-in, check-out, mất, hư)

### Models

#### Luggage

```javascript
- visitRequest (ObjectId): Liên kết với VisitRequest
- itemName (String, required): Tên vật dụng
- description (String): Mô tả chi tiết
- quantity (Number): Số lượng (mặc định: 1)
- itemType (Enum): PERSONAL_ITEM | LUGGAGE | VEHICLE | EQUIPMENT | OTHER
- estimatedValue (Number): Giá trị ước tính
- status (Enum): CHECKED_IN | CHECKED_OUT | LOST | DAMAGED | RETURNED
- checkedInBy (ObjectId): User ghi nhận check-in
- checkedInAt (Date): Thời gian check-in
- checkedOutBy (ObjectId): User ghi nhận check-out
- checkedOutAt (Date): Thời gian check-out
- itemImageData (String): Base64 ảnh vật dụng
- returnImageData (String): Base64 ảnh khi trả lại
- trackingCode (String, unique): Mã tracking (tự động sinh)
- notes (String): Ghi chú (khi mất/hư)
- Timestamps: createdAt, updatedAt
```

### API Endpoints

#### 1. Thêm Hành Lý Mới

**POST** `/api/luggage`

**Yêu cầu:**

```json
{
  "visitRequestId": "ObjectId",
  "itemName": "Ba lô xanh",
  "description": "Ba lô nylon, màu xanh lá, logo Nike",
  "quantity": 1,
  "itemType": "LUGGAGE",
  "estimatedValue": 500000,
  "itemImageData": "data:image/jpeg;base64,..."
}
```

**Phản hồi:**

```json
{
  "message": "Thêm hành lý thành công",
  "luggage": {
    "_id": "ObjectId",
    "visitRequest": "ObjectId",
    "itemName": "Ba lô xanh",
    "trackingCode": "LUG-20260407-12345",
    "status": "CHECKED_IN",
    "checkedInAt": "2026-04-07T10:30:00Z",
    ...
  }
}
```

**Quyền:** Moderator, Admin

---

#### 2. Lấy Danh Sách Hành Lý Theo Yêu Cầu

**GET** `/api/luggage/visit/:visitRequestId`

**Phản hồi:**

```json
{
  "visitRequestId": "ObjectId",
  "count": 3,
  "items": [
    {
      "_id": "ObjectId",
      "itemName": "Ba lô xanh",
      "trackingCode": "LUG-20260407-12345",
      "status": "CHECKED_IN",
      "quantity": 1,
      "estimatedValue": 500000,
      "checkedInBy": {
        "_id": "ObjectId",
        "displayName": "Nguyễn Văn A"
      },
      "checkedInAt": "2026-04-07T10:30:00Z"
    }
  ]
}
```

**Quyền:** Moderator, Admin

---

#### 3. Check-out Hành Lý (Ghi Nhận Mang Ra)

**PATCH** `/api/luggage/:luggageId/checkout`

**Yêu cầu:**

```json
{
  "returnImageData": "data:image/jpeg;base64,...",
  "notes": "Vật dụng còn nguyên vẹn"
}
```

**Phản hồi:**

```json
{
  "message": "Check-out hành lý thành công",
  "luggage": {
    "_id": "ObjectId",
    "status": "CHECKED_OUT",
    "checkedOutBy": {
      "_id": "ObjectId",
      "displayName": "Nguyễn Văn B"
    },
    "checkedOutAt": "2026-04-07T14:45:00Z"
  }
}
```

**Quyền:** Moderator, Admin

---

#### 4. Cập Nhật Trạng Thái Hành Lý

**PATCH** `/api/luggage/:luggageId/status`

**Yêu cầu:**

```json
{
  "status": "LOST",
  "notes": "Khách báo mất tại cổng"
}
```

**Trạng Thái Hợp Lệ:**

- `CHECKED_IN`: Đã check-in vào
- `CHECKED_OUT`: Đã check-out ra
- `LOST`: Bị mất
- `DAMAGED`: Bị hư hỏng
- `RETURNED`: Đã trả lại

**Phản hồi:**

```json
{
  "message": "Cập nhật trạng thái thành công: LOST",
  "luggage": {
    "_id": "ObjectId",
    "status": "LOST",
    "notes": "Khách báo mất tại cổng"
  }
}
```

**Quyền:** Moderator, Admin

---

#### 5. Xóa Hành Lý

**DELETE** `/api/luggage/:luggageId`

**Phản hồi:**

```json
{
  "message": "Xóa hành lý thành công"
}
```

**Lưu Ý:** Chỉ được xóa hành lý đang ở trạng thái CHECKED_IN

**Quyền:** Moderator, Admin

---

#### 6. Lấy Tất Cả Hành Lý (Có Bộ Lọc)

**GET** `/api/luggage?status=CHECKED_IN&visitRequestId=&itemType=LUGGAGE&page=1&limit=20`

**Query Parameters:**

- `status` (optional): CHECKED_IN, CHECKED_OUT, LOST, DAMAGED, RETURNED
- `visitRequestId` (optional): ObjectId
- `itemType` (optional): PERSONAL_ITEM, LUGGAGE, VEHICLE, EQUIPMENT, OTHER
- `page` (optional, default: 1): Trang
- `limit` (optional, default: 20, max: 100): Số item mỗi trang

**Phản hồi:**

```json
{
  "data": [
    {
      "_id": "ObjectId",
      "itemName": "Ba lô xanh",
      "trackingCode": "LUG-20260407-12345",
      "status": "CHECKED_IN",
      "visitRequest": {
        "_id": "ObjectId",
        "requestCode": "REQ-20260407-1234"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Quyền:** Moderator, Admin

---

#### 7. Lấy Thống Kê Hành Lý

**GET** `/api/luggage/stats/summary`

**Phản hồi:**

```json
{
  "byStatus": [
    {
      "_id": "CHECKED_IN",
      "count": 45,
      "totalValue": 15000000
    },
    {
      "_id": "CHECKED_OUT",
      "count": 120,
      "totalValue": 45000000
    },
    {
      "_id": "LOST",
      "count": 2,
      "totalValue": 2000000
    }
  ],
  "byType": [
    {
      "_id": "LUGGAGE",
      "count": 85
    },
    {
      "_id": "PERSONAL_ITEM",
      "count": 65
    },
    {
      "_id": "VEHICLE",
      "count": 15
    }
  ]
}
```

**Quyền:** Moderator, Admin

---

#### 8. Lấy Chi Tiết Yêu Cầu Ra/Vào (Với Danh Sách Hành Lý)

**GET** `/api/visits/:id`

**Phản hồi:**

```json
{
  "visit": {
    "_id": "ObjectId",
    "requestCode": "REQ-20260407-1234",
    "visitorName": "Nguyễn Thị C",
    "status": "CHECKED_IN",
    ...
  },
  "luggage": [
    {
      "_id": "ObjectId",
      "itemName": "Ba lô xanh",
      "trackingCode": "LUG-20260407-12345",
      "status": "CHECKED_IN"
    }
  ],
  "luggageCount": 3
}
```

**Quyền:** Tất cả user đã xác thực

---

### Luồng Sử Dụng

#### Quy Trình Kiểm Tra Hành Lý Khách

1. **Khách Check-In (có hành lý)**
   - Security gọi `POST /api/gate/check-in` với thông tin khách

2. **Ghi Nhận Hành Lý**
   - Security gọi `POST /api/luggage` để thêm từng vật dụng
   - Chụp ảnh vật dụng (itemImageData) để có bằng chứng

3. **Xem Danh Sách**
   - Security kiểm tra `GET /api/luggage/visit/:visitId` để xem những vật dụng đã ghi nhận

4. **Khách Check-Out**
   - Security gọi `PATCH /api/luggage/:luggageId/checkout` để ghi nhận từng vật dụng khi khách trả lại
   - Chụp ảnh lại vật dụng (returnImageData) để so sánh

5. **Nếu Có Vấn Đề (Mất/Hư)**
   - Security gọi `PATCH /api/luggage/:luggageId/status` để cập nhật trạng thái LOST hoặc DAMAGED
   - Ghi ghi chú chi tiết

---

### Ghi Chú Quan Trọng

1. **Mã Tracking Tự Động:**
   - Mỗi hành lý được gán một `trackingCode` duy nhất để dễ dàng tra cứu
   - Format: `LUG-YYYYMMDD-XXXXX`

2. **Hình Ảnh:**
   - Có thể upload ảnh dưới dạng Base64
   - Chụp lúc check-in và check-out để có bằng chứng visual

3. **Audit Trail:**
   - Tất cả thao tác tương tác hành lý được ghi lại vào AuditLog
   - Bao gồm: ai, khi nào, hành động gì, chi tiết gì

4. **Quyền Hạn:**
   - Chỉ Moderator và Admin mới có thể quản lý hành lý
   - User thường có thể xem chi tiết yêu cầu của họ và danh sách hành lý

5. **Khóa Ràng Buộc:**
   - Chỉ được thêm hành lý sau khi khách đã check-in
   - Chỉ được xóa hành lý nếu nó đang ở trạng thái CHECKED_IN (mới check-in, chưa check-out)

---
