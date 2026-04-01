# Elentec2 - Full Stack Application với Role-Based Authentication

Ứng dụng full-stack sử dụng **React + Vite** (frontend) và **Node.js + Express + MongoDB** (backend) với hệ thống phân quyền 4 cấp.

## 🎯 Tính năng chính

- ✅ Authentication (Đăng ký, đăng nhập, đăng xuất)
- ✅ Hệ thống phân quyền 4 cấp: User, Moderator, Admin, SuperAdmin
- ✅ JWT Access Token + Refresh Token (Cookie)
- ✅ Protected Routes theo từng role
- ✅ Admin Panel để quản lý users và phân quyền
- ✅ Moderator Panel để xem danh sách users
- ✅ Invoice management

## 🔐 Phân quyền

### 1. **User** (Người dùng thông thường)

- Đăng ký, đăng nhập, đăng xuất
- Quản lý invoices
- Xem profile

### 2. **Moderator** (Người kiểm duyệt)

- Tất cả quyền của User
- Xem danh sách tất cả users
- Lọc users theo role
- Xem chi tiết user

### 3. **Admin** (Quản trị viên)

- Tất cả quyền của Moderator
- Gán role cho users (user, moderator, admin)
- Xoá role từ users

### 4. **SuperAdmin** (Siêu quản trị)

- Tất cả quyền của Admin
- Gán role superadmin
- Xóa users khỏi hệ thống

## 📁 Cấu trúc dự án

```
Elentec2/
├── backend/                 # Backend cũ (có thể bỏ)
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── auth/      # Auth components (ProtectedRouter, RoleProtectedRoute)
│   │   │   ├── layout/    # Layout components
│   │   │   └── ui/        # UI components
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Page components
│   │   │   ├── Auth/      # Login, SignUp
│   │   │   ├── Dashboard/ # Dashboard
│   │   │   ├── Admin/     # AdminPanel
│   │   │   ├── Moderator/ # ModeratorPanel
│   │   │   └── ...
│   │   └── utils/         # Utilities (axios, apiPaths)
│   ├── .env               # Environment variables
│   └── package.json
└── backend/               # Node.js + Express backend
    ├── src/
    │   ├── controllers/   # Business logic
    │   ├── middlewares/   # Auth middleware
    │   ├── models/        # MongoDB models
    │   ├── routes/        # API routes
    │   ├── libs/          # Database connection
    │   └── server.js      # Entry point
    ├── .env               # Environment variables
    └── package.json
```

## 🚀 Cài đặt và Chạy

### Prerequisites

- Node.js (v18+)
- MongoDB (locally hoặc MongoDB Atlas)
- npm hoặc yarn

### 1. Clone repository

```bash
cd Desktop/Elentec2
```

### 2. Setup Backend (Server)

```bash
cd backend
npm install
```

Tạo file `.env` trong folder `backend`:

```env
PORT=5001
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/elentec2
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URLS=http://localhost:5173,http://192.168.1.100:5173
NODE_ENV=development
```

Chạy server:

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5001`

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

File `.env` cho frontend (tuỳ chọn):

```env
# Có thể bỏ trống VITE_API_URL để frontend tự nhận host hiện tại
# và gọi backend theo dạng: http://<current-host>:5001/api
# Ví dụ:
# - Mở bằng localhost -> gọi http://localhost:5001/api
# - Mở bằng LAN IP   -> gọi http://192.168.1.100:5001/api

# Khi deploy production khác domain/backend, đặt cố định:
# VITE_API_URL=https://api.your-domain.com/api
```

Chạy frontend:

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 3.1 Chạy nhanh môi trường dev từ thư mục gốc

```bash
cd ..
npm install
npm run dev
```

Lệnh này sẽ chạy đồng thời:

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

## ⚡ Quick Start cho dev mới (10 phút)

Mục tiêu: chạy được dự án local và đi qua full flow `Requester -> Approver -> Security`.

### Bước 1: Cài dependency (2 phút)

```bash
npm run install:all
```

### Bước 2: Cấu hình môi trường (2 phút)

Backend `.env` tối thiểu:

```env
PORT=5001
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/elentec2
JWT_SECRET=your_super_secret_jwt_key_change_this
CLIENT_URLS=http://localhost:5173,http://<LAN_IP>:5173
NODE_ENV=development
```

Frontend có thể để mặc định (không cần `VITE_API_URL` khi chạy local).

### Bước 3: Tạo SuperAdmin đầu tiên (1 phút)

Làm theo hướng dẫn trong file:

- `SUPERADMIN_SETUP.md`

### Bước 4: Chạy dự án (1 phút)

```bash
npm run dev
```

Mở:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

### Bước 5: Đi qua flow Access (3-4 phút)

1. Login tài khoản `user` -> tạo yêu cầu tại `/access/requests`.
2. Login tài khoản `moderator/admin` -> duyệt tại `/access/approvals`.
3. Vào `/access/gate` -> nhập `requestCode` (vd `REQ-...`) để:

- `Verify`
- `Check-in`
- `Check-out`
- Hoặc `Manual Deny` khi cần ngoại lệ

4. Nếu test nhà thầu: chọn `Nhà thầu/đối tác thi công` và tick checklist an toàn trước khi gửi duyệt.
5. Nếu test blacklist/whitelist: gọi API policy tại `/api/access-control/policies` bằng tài khoản admin.

### Bước 6: Tài liệu đọc nhanh (1 phút)

- Flow backend: `docs/README_VISIT_FLOW.md`
- Controller chính: `backend/src/controllers/visitController.js`
- Form SOP vận hành: thư mục `SOP_Forms/`

### Checklist Done

- [ ] Tạo được request mới
- [ ] Duyệt được request
- [ ] Verify/check-in/check-out thành công ở Gate Console
- [ ] Không có lỗi 401/403 ngoài dự kiến

### 4. Truy cập từ thiết bị khác trong mạng LAN

- Lấy IP máy chạy backend/frontend (Windows): `ipconfig`
- Mở frontend từ máy khác: `http://<LAN_IP>:5173`
- Đảm bảo backend `.env` có `HOST=0.0.0.0`
- Đảm bảo backend `.env` có `CLIENT_URLS` chứa localhost và origin LAN, ví dụ: `http://localhost:5173,http://<LAN_IP>:5173`
- Nếu bị chặn kết nối, mở firewall cho cổng `5001` và `5173`

## 📡 API Endpoints

### Public Routes

```
POST /api/auth/signup       # Đăng ký
POST /api/auth/signin       # Đăng nhập
```

### Protected Routes (cần token)

```
POST /api/auth/signout      # Đăng xuất
```

### Access Control Routes (user/moderator/admin)

```
GET  /api/visits                            # Danh sách yêu cầu (user: của mình, moderator/admin: tất cả)
POST /api/visits                            # Tạo yêu cầu ra/vào
POST /api/visits/:id/cancel                 # Hủy yêu cầu

GET  /api/approvals/inbox                   # Inbox chờ duyệt (moderator/admin)
POST /api/approvals/:requestId/approve      # Duyệt yêu cầu
POST /api/approvals/:requestId/reject       # Từ chối yêu cầu

POST /api/gate/verify-qr                    # Xác minh mã tại cổng
POST /api/gate/check-in                     # Check-in tại cổng
POST /api/gate/check-out                    # Check-out tại cổng
POST /api/gate/manual-deny                  # Ghi nhận từ chối thủ công

GET  /api/reports/realtime                  # KPI realtime
GET  /api/reports/daily?from=YYYY-MM-DD&to=YYYY-MM-DD
GET  /api/reports/overdue                   # Danh sách quá giờ
GET  /api/reports/export?type=excel|csv&from=YYYY-MM-DD&to=YYYY-MM-DD
```

### Moderator Routes (moderator+)

```
GET /api/auth/moderator/users                  # Lấy tất cả users
GET /api/auth/moderator/users/:userId          # Lấy user theo ID
GET /api/auth/moderator/users/role/:role       # Lấy users theo role
```

### Admin Routes (admin+)

```
POST /api/auth/admin/assign-role               # Gán role
POST /api/auth/admin/remove-role               # Xóa role
GET  /api/auth/admin/all-users                 # Lấy tất cả users
GET  /api/auth/admin/users/:userId             # Lấy user theo ID
GET  /api/auth/admin/users/role/:role          # Lấy users theo role
```

### SuperAdmin Routes (superadmin only)

```
DELETE /api/auth/superadmin/delete-user        # Xóa user
POST   /api/auth/superadmin/assign-role        # Gán role (bao gồm superadmin)
POST   /api/auth/superadmin/remove-role        # Xóa role
```

## 🔧 Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Axios
- Tailwind CSS 4
- Lucide React (icons)
- React Hot Toast

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- cookie-parser
- cors

## 📝 Cách sử dụng

### 1. Đăng ký tài khoản

- Truy cập `http://localhost:5173/signup`
- Điền thông tin: username, email, displayName, password
- Mặc định role là `user`

### 2. Đăng nhập

- Truy cập `http://localhost:5173/login`
- Nhập username và password
- Sau khi login, bạn sẽ được redirect về `/dashboard`

### 3. Gán role Admin (Manual - qua MongoDB)

Để test chức năng admin, bạn cần gán role manually trong MongoDB:

```javascript
// Mở MongoDB shell hoặc Compass
db.users.updateOne(
  { username: "your_username" },
  { $set: { role: "superadmin" } },
);
```

### 4. Sử dụng Admin Panel

- SuperAdmin login → Truy cập `/admin`
- Gán role cho users khác
- Xóa users (nếu cần)

### 5. Sử dụng Access Reports + Export

- Vào `/access/reports` bằng tài khoản `moderator` hoặc `admin`
- Chọn `from/to` nếu muốn lọc theo ngày
- `Làm mới` để tải KPI realtime/daily/overdue
- `Xuất Excel` hoặc `Xuất CSV` để tải báo cáo

## 🎨 Frontend Routes

```
/                    # Landing page
/signup              # Đăng ký
/login               # Đăng nhập
/dashboard           # Dashboard (protected)
/invoices            # Quản lý invoices (protected)
/profile             # Profile settings (protected)
/moderator           # Moderator Panel (moderator+)
/admin               # Admin Panel (admin+)
```

## 🛡️ Security Features

- ✅ Password hashing với bcrypt (salt=10)
- ✅ JWT với expiration (90 minutes)
- ✅ Refresh token trong HTTP-only cookies
- ✅ Session-based refresh tokens trong MongoDB
- ✅ Auto logout khi token hết hạn
- ✅ CORS protection
- ✅ Role-based access control middleware

## 🐛 Troubleshooting

### MongoDB connection error

- Kiểm tra MongoDB có đang chạy không: `mongod`
- Kiểm tra MONGO_URI trong `.env`

### CORS error

- Kiểm tra `CLIENT_URLS` trong server `.env`
- Đảm bảo frontend origin (ví dụ `http://192.168.1.100:5173`) có trong `CLIENT_URLS`

### Token expired

- Logout và login lại
- Clear localStorage trong browser DevTools

## 📄 License

MIT

## 📌 Team Rules

- Quy tắc bắt buộc khi làm tính năng mới/mở rộng: `DEVELOPMENT_RULES.md`

## 👤 Author

Elentec Team
