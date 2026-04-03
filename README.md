# Elentec2 - Hệ thống quản lý ra/vào cổng & IT Asset

Ứng dụng full-stack sử dụng **React + Vite** (frontend) và **Node.js + Express + MongoDB** (backend).

## Mục lục

- [Tech Stack](#-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [Tạo Admin đầu tiên](#-tạo-admin-đầu-tiên)
- [Phân quyền hệ thống (Role)](#-phân-quyền-hệ-thống-role)
- [Phân cấp chức vụ (Position)](#-phân-cấp-chức-vụ-position)
- [Quản lý phòng ban (Department)](#-quản-lý-phòng-ban-department)
- [Luồng Access (Visit Flow)](#-luồng-access-visit-flow)
- [API Endpoints](#-api-endpoints)
- [Excel Import/Export máy tính](#-excel-importexport-máy-tính)
- [Biểu mẫu SOP vận hành](#-biểu-mẫu-sop-vận-hành)
- [Frontend Routes](#-frontend-routes)
- [Bảo mật](#-bảo-mật)
- [Quy tắc phát triển](#-quy-tắc-phát-triển)
- [Troubleshooting](#-troubleshooting)
- [Kiểm tra dự án](#-kiểm-tra-dự-án)

---

## 🔧 Tech Stack

| Frontend           | Backend              |
| ------------------ | -------------------- |
| React 19           | Node.js              |
| Vite 7             | Express 5            |
| React Router DOM 7 | MongoDB + Mongoose 9 |
| Axios              | JWT (jsonwebtoken)   |
| Tailwind CSS 4     | bcrypt               |
| Lucide React       | cookie-parser, cors  |
| React Hot Toast    | ExcelJS, multer      |
| Recharts           |                      |

---

## 📁 Cấu trúc dự án

```
Elentec2/
├── frontend/
│   └── src/
│       ├── components/    # auth/, landing/, layout/, position/, ui/
│       ├── context/       # AuthContext
│       ├── hooks/         # useAuth, useForm, usePosition
│       ├── pages/         # Access/, Admin/, Auth/, Dashboard/, Department/, IT/, LandingPage/, Profile/, PositionManagement/
│       └── utils/         # axiosInstance, apiPaths, apiHandler
└── backend/
    ├── scripts/           # test-access-flow.js
    └── src/
        ├── controllers/   # auth, visit, report, computer, department, position, profile, accessPolicy, admin
        ├── middlewares/    # authMiddleware (verifyToken, isAdmin, isManager...)
        ├── models/         # User, VisitRequest, AccessPolicyEntry, AuditLog, ComputerInfo, Department, GateCard, session
        ├── routes/         # auth, visit, approval, gate, report, computer, department, position, user, accessPolicy
        ├── utils/          # encryption, positionHierarchy, departmentMembership
        ├── libs/           # db.js
        └── server.js
```

---

## 🚀 Cài đặt và chạy

### Yêu cầu

- Node.js v18+
- MongoDB (local hoặc Atlas)

### Cài đặt nhanh

```bash
npm run install:all
```

### Cấu hình backend `.env`

```env
PORT=5001
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/elentec2
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URLS=http://localhost:5173,http://<LAN_IP>:5173
NODE_ENV=development
```

Frontend không cần `.env` khi chạy local (tự nhận host hiện tại).

### Chạy dự án

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

### Truy cập LAN

- Backend `.env` cần `HOST=0.0.0.0` và `CLIENT_URLS` chứa IP LAN
- Mở firewall cho cổng `5001` và `5173`

---

## 👑 Tạo Admin đầu tiên

Hệ thống cần ít nhất 1 Admin để quản lý users. Tạo Admin đầu tiên qua MongoDB:

### Cách 1: MongoDB Shell

```bash
mongosh
use elentec2

db.users.insertOne({
  idCompanny: "admin",
  hashedPassword: "$2b$10$BzEGKxQQPxLq8HGz3QYaBuum4wNZYztXhOvNOdX5wZvQPVxFIz4Ci",
  email: "admin@example.com",
  displayName: "Admin",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

> Đăng nhập: `admin` / `admin123`

### Cách 2: MongoDB Compass

Insert document vào collection `users` với JSON tương tự trên.

### Cách 3: Tạo hash password tùy chọn

```javascript
const bcrypt = require("bcrypt");
console.log(bcrypt.hashSync("your_password", 10));
```

### Sau khi có Admin

1. Đăng nhập → `/admin` → **+ Tạo User Mới**
2. Chọn role và điền thông tin
3. **Đổi password mặc định ngay sau khi tạo**

---

## 🔐 Phân quyền hệ thống (Role)

Hệ thống có **3 role** (enum trong User model: `admin`, `moderator`, `user`):

| Role          | Quyền                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| **User**      | Đăng ký/đăng nhập, tạo yêu cầu ra/vào, xem profile                                                                 |
| **Moderator** | + Xem tất cả users, duyệt/từ chối yêu cầu, thao tác cổng                                                           |
| **Admin**     | + Gán/xóa role, tạo user, xóa user (trừ admin khác), quản lý department, quản lý policy, quản lý máy tính, báo cáo |

> **Lưu ý:** Không có role `superadmin` trong code. Admin là role cao nhất.

---

## 📊 Phân cấp chức vụ (Position)

Hệ thống hỗ trợ 4 cấp chức vụ tổ chức, hoạt động song song với role hệ thống:

```
Manager (Level 4) → Assistant Manager (Level 3) → Supervisor (Level 2) → Staff (Level 1)
```

### Ma trận quyền theo chức vụ

| Quyền           | Manager | Asst Manager | Supervisor | Staff |
| --------------- | ------- | ------------ | ---------- | ----- |
| Quản lý users   | ✅      | ❌           | ❌         | ❌    |
| Quản lý chức vụ | ✅      | ❌           | ❌         | ❌    |
| Xem báo cáo     | ✅      | ✅           | ✅         | ❌    |
| Xóa dữ liệu     | ✅      | ❌           | ❌         | ❌    |
| Export dữ liệu  | ✅      | ✅           | ✅         | ❌    |
| Import dữ liệu  | ✅      | ✅           | ❌         | ❌    |
| Sửa máy tính    | ✅      | ✅           | ❌         | ❌    |

### Position API

```
GET  /api/positions/hierarchy        # Thông tin cấp bậc
GET  /api/positions/users            # Danh sách users (filter ?position=X)
GET  /api/positions/my-info          # Thông tin chức vụ của mình
GET  /api/positions/subordinates     # Nhân viên cấp dưới
PUT  /api/positions/:userId          # Cập nhật chức vụ (Manager+)
POST /api/positions/bulk-update      # Cập nhật hàng loạt (Admin)
GET  /api/positions/statistics       # Thống kê chức vụ (Admin)
```

### Middleware kiểm tra chức vụ

- `isManager()` — Manager trở lên
- `isAssistantManagerOrAbove()` — Asst Manager trở lên
- `isSupervisor()` — Supervisor trở lên
- `checkPosition(["Manager", "Supervisor"])` — Chức vụ cụ thể
- `checkPositionLevel(3)` — Level tối thiểu

---

## 🏢 Quản lý phòng ban (Department)

**Chỉ Admin** có quyền quản lý phòng ban.

### Department API

| Method | Endpoint                             | Mô tả                    |
| ------ | ------------------------------------ | ------------------------ |
| GET    | `/api/departments`                   | Danh sách departments    |
| GET    | `/api/departments/:id`               | Chi tiết department      |
| GET    | `/api/departments/:id/users`         | Users trong department   |
| POST   | `/api/departments`                   | Tạo department           |
| PUT    | `/api/departments/:id`               | Cập nhật department      |
| DELETE | `/api/departments/:id`               | Xóa department           |
| PATCH  | `/api/departments/:id/toggle-status` | Bật/tắt department       |
| POST   | `/api/departments/:id/users/add`     | Thêm user vào department |
| POST   | `/api/departments/:id/users/remove`  | Xóa user khỏi department |

---

## 🚪 Luồng Access (Visit Flow)

### Quy trình chính

```
Requester tạo yêu cầu → Approver duyệt/từ chối → Security verify/check-in/check-out
```

### Trạng thái hồ sơ (State Machine)

```
PENDING_APPROVAL → APPROVED → CHECKED_IN → CHECKED_OUT
                → REJECTED
                → CANCELLED
                           → OVERDUE (quá giờ)
```

### Loại đối tượng

`EMPLOYEE` | `GUEST` | `CONTRACTOR` | `VEHICLE`

### Quy tắc nghiệp vụ

- Không check-in nếu chưa APPROVED
- Không check-out nếu chưa CHECKED_IN
- QR hết hạn sẽ bị chặn
- Từ chối phê duyệt bắt buộc có lý do
- Manual deny phải lưu log audit
- Nhà thầu (CONTRACTOR) bắt buộc hoàn thành checklist an toàn trước duyệt
- Blacklist/whitelist kiểm tra khi tạo hồ sơ và tại cổng
- Check-in/check-out xử lý idempotent

### Field quan trọng trong VisitRequest

- `requestCode`: mã nghiệp vụ (VD: `REQ-20260308-1234`)
- `qrToken`, `qrExpiresAt`: xác minh tại cổng
- `approvedBy/At`, `rejectedBy/At/Reason`: dấu vết phê duyệt
- `checkInAt`, `checkOutAt`: thời gian thực tế
- `deniedLogs[]`: nhật ký từ chối thủ công
- `safetyChecklistCompleted/Note`: checklist nhà thầu

---

## 📡 API Endpoints

### Auth

```
POST /api/auth/signup                       # Đăng ký
POST /api/auth/signin                       # Đăng nhập
POST /api/auth/signout                      # Đăng xuất
```

### Visit (Requester)

```
GET  /api/visits                            # Danh sách yêu cầu
POST /api/visits                            # Tạo yêu cầu
POST /api/visits/:id/cancel                 # Hủy yêu cầu
```

### Approval (Moderator/Admin)

```
GET  /api/approvals/inbox                   # Danh sách chờ duyệt
POST /api/approvals/:requestId/approve      # Duyệt
POST /api/approvals/:requestId/reject       # Từ chối
```

### Gate (Security)

```
POST /api/gate/verify-qr                    # Xác minh mã
POST /api/gate/check-in                     # Check-in (yêu cầu CCCD)
POST /api/gate/check-out                    # Check-out (yêu cầu CCCD)
POST /api/gate/manual-deny                  # Từ chối thủ công
```

### Report

```
GET  /api/reports/realtime                  # KPI realtime
GET  /api/reports/daily?from=...&to=...     # Thống kê theo ngày
GET  /api/reports/overdue                   # Danh sách quá giờ
GET  /api/reports/export?type=excel|csv     # Xuất báo cáo
```

### Access Policy (Admin)

```
GET  /api/access-control/policies           # Danh sách policy
POST /api/access-control/policies           # Thêm/cập nhật policy
PATCH /api/access-control/policies/:id/toggle  # Bật/tắt policy
```

### Admin / Moderator

```
GET  /api/auth/moderator/users              # Tất cả users (Moderator+)
GET  /api/auth/moderator/users/:userId      # Chi tiết user (Moderator+)
POST /api/auth/admin/assign-role            # Gán role (Admin)
POST /api/auth/admin/remove-role            # Xóa role (Admin)
POST /api/auth/admin/create-user            # Tạo user (Admin)
DELETE /api/auth/admin/delete-user          # Xóa user (Admin, trừ admin khác)
GET  /api/auth/admin/all-users              # Tất cả users (Admin)
PUT  /api/auth/admin/users/:userId          # Cập nhật user (Admin)
```

---

## 📊 Excel Import/Export máy tính

File Excel gồm **56 cột** chia 4 phần:

### Phần 1: Information (24 cột)

Bắt buộc: **ID**, **Full Name**, **Email**, **Dept**, **Computer Name**

Các cột khác: STT, Asset Code, Phone, Position, IP/MAC Address, Computer Name, Desktop/Laptop, Manufacturer, Model, Serial, CPU, RAM, HDD, SSD, VGA, Status, Notes...

### Phần 2: OS (4 cột)

Version OS, OS License, OS Key, OS Note

### Phần 3: MS Office (4 cột)

Version Office, MS License, Office Key, Office Note

### Phần 4: Software (24 cột = 6 phần mềm × 4 cột)

Mỗi phần mềm có: Version, License, Key, Note

Phần mềm: **AutoCAD**, **NX**, **PowerMill**, **Mastercam**, **ZWCAD**, **Symantec**

### Quy tắc

- Product Keys được **mã hóa AES-256** khi import
- Chỉ Admin export được full keys (user thường thấy `****..XXXXX`)
- Hỗ trợ `.xlsx`, `.xls`
- Status mặc định: Active

---

## 📋 Biểu mẫu SOP vận hành

Các biểu mẫu mẫu phục vụ quy trình vận hành cổng:

### FM-01: Phiếu Đăng Ký Khách/Đối Tác

Ghi nhận thông tin khách, mục đích, lịch làm việc, kết quả phê duyệt.

Nội dung: Mã yêu cầu, thông tin khách (tên, CCCD, SĐT, biển xe), mục đích, người tiếp đón, thời gian dự kiến, khu vực, checklist trước gửi duyệt, kết quả phê duyệt.

### FM-02: Phiếu Xác Nhận Ngoại Lệ Tại Cổng

Ghi nhận xử lý ngoại lệ (khách không QR, QR lỗi...).

Nội dung: Mã ngoại lệ, thông tin người vào, nguyên nhân, bước xử lý, kết quả, xác nhận trách nhiệm.

### FM-03: Nhật Ký Ca Trực Security

Báo cáo hoạt động trong ca trực.

Nội dung: Thông tin ca, tổng hợp check-in/out, nhật ký sự kiện theo thời gian, bàn giao cuối ca.

### FM-04: Báo Cáo Đối Soát Cuối Ngày

Đối soát số liệu vận hành cuối ngày.

Nội dung: Chỉ số vận hành (tạo/duyệt/từ chối/check-in/out/overdue), danh sách cần xử lý, bất thường hệ thống, hành động tiếp theo.

### FM-05: Báo Cáo Sự Cố An Ninh

Ghi nhận và xử lý sự cố an ninh.

Nội dung: Thông tin sự cố, mô tả, xử lý ban đầu, quyết định, ảnh hưởng, bài học kinh nghiệm, đóng sự cố.

---

## 🎨 Frontend Routes

```
/                        # Landing page
/login                   # Đăng nhập
/signup                  # Đăng ký
/dashboard               # Dashboard (protected)
/profile                 # Profile settings
/admin                   # Admin Panel (admin)
/admin/positions         # Quản lý chức vụ (admin)
/departments             # Quản lý phòng ban (moderator/admin)
/it/computers            # Quản lý máy tính (admin)
/access/requests         # Tạo yêu cầu ra/vào (user/moderator/admin)
/access/approvals        # Duyệt yêu cầu (moderator/admin)
/access/gate             # Gate Console (moderator/admin)
/access/reports          # Báo cáo (moderator/admin)
```

---

## 🛡️ Bảo mật

- Password hashing với bcrypt (salt=10)
- JWT Access Token (90 phút) + Refresh Token (HTTP-only cookie)
- Session-based refresh tokens trong MongoDB
- Auto logout khi token hết hạn
- CORS protection theo `CLIENT_URLS`
- Role-based + Position-based access control middleware
- Product keys mã hóa AES-256

---

## 📌 Quy tắc phát triển

### Trước khi code

1. Phải có mô tả yêu cầu rõ ràng (input, output, role)
2. Xác định phạm vi: backend, frontend, hoặc cả hai
3. Liệt kê trạng thái bị ảnh hưởng
4. Không code nếu chưa rõ acceptance criteria

### Backend

1. Endpoint mới phải có `verifyToken` + middleware role
2. Input phải validate đầy đủ, trả lỗi rõ ràng
3. Không bỏ qua state machine
4. Thao tác nhạy cảm phải có audit log
5. Không hard-code secrets

### Frontend

1. Dùng `API_PATHS`, không URL cứng
2. Xử lý lỗi thống nhất qua `handleApiError`
3. Có trạng thái `loading`, `empty`, `error`
4. Nút quan trọng phải enable/disable đúng trạng thái
5. Form validate client-side trước submit

### Dữ liệu

1. Thêm field model phải tương thích dữ liệu cũ
2. Thay đổi schema phải cập nhật tài liệu
3. Thêm enum trạng thái → cập nhật validation + UI + báo cáo

### Bảo mật

1. Không log token/password/PII ra console production
2. Endpoint nội bộ phải giới hạn đúng role
3. Không merge code còn bypass quyền tạm thời

### Review & Merge

1. PR phải mô tả: vấn đề, giải pháp, files thay đổi, cách test
2. Không merge khi còn lỗi compile/lint
3. Không merge nếu chưa test end-to-end luồng chính

### Definition of Done

- [ ] Đúng yêu cầu nghiệp vụ
- [ ] API/DB/UI nhất quán
- [ ] Kiểm tra quyền và validate đầy đủ
- [ ] Xử lý lỗi rõ ràng
- [ ] Build frontend pass
- [ ] Không errors trong file đã sửa
- [ ] Đã cập nhật tài liệu liên quan

---

## 🐛 Troubleshooting

| Vấn đề                   | Giải pháp                                        |
| ------------------------ | ------------------------------------------------ |
| MongoDB connection error | Kiểm tra MongoDB đang chạy, kiểm tra `MONGO_URI` |
| CORS error               | Kiểm tra `CLIENT_URLS` có chứa frontend origin   |
| Token expired            | Logout và login lại, clear localStorage          |
| 403 Forbidden            | Xác nhận role đúng (moderator/admin)             |
| Gate verify lỗi          | Kiểm tra `requestCode`, `qrToken`, `idNumber`    |

---

## ✅ Kiểm tra dự án (2025-07-10)

### Lệnh kiểm tra

```bash
npm run lint --prefix frontend        # ESLint
npm run build --prefix frontend       # Vite build
npm run test:accessflow --prefix backend  # Integration test
node backend/test-encryption.js       # Encryption test
node backend/test-excel-structure.js  # Excel structure test
```

### Kết quả

| Kiểm tra                     | Kết quả                      |
| ---------------------------- | ---------------------------- |
| Frontend lint                | PASS                         |
| Frontend build               | PASS                         |
| Backend access flow test     | FAIL — check-in yêu cầu CCCD |
| Backend encryption test      | PASS                         |
| Backend excel structure test | PASS                         |
| VS Code diagnostics          | Không lỗi                    |
| TODO/FIXME/HACK markers      | Không tìm thấy               |

### Việc cần làm

1. Cập nhật `backend/scripts/test-access-flow.js` để gửi CCCD khi check-in/check-out
2. Đồng bộ tài liệu flow nếu rule CCCD là bắt buộc

---

## 📄 License

MIT

## 👤 Author

Elentec Team
