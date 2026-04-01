# Hướng dẫn tạo SuperAdmin đầu tiên

Vì hệ thống giờ chỉ cho phép SuperAdmin tạo tài khoản mới, bạn cần tạo SuperAdmin đầu tiên thông qua MongoDB.

## Cách 1: Sử dụng MongoDB Compass (GUI)

1. Mở MongoDB Compass
2. Kết nối đến database: `mongodb://localhost:27017/elentec2`
3. Chọn collection `users`
4. Click nút "Insert Document"
5. Paste JSON sau:

```json
{
  "username": "superadmin",
  "hashedPassword": "$2b$10$YourHashedPasswordHere",
  "email": "superadmin@example.com",
  "displayName": "Super Admin",
  "role": "superadmin",
  "createdAt": { "$date": "2026-03-03T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-03-03T00:00:00.000Z" }
}
```

**Lưu ý:** Bạn cần hash password trước. Xem Cách 3 để tạo hash.

## Cách 2: Sử dụng MongoDB Shell

```bash
# Kết nối MongoDB
mongosh

# Chuyển sang database
use elentec2

# Tạo SuperAdmin (password: admin123)
db.users.insertOne({
  username: "superadmin",
  hashedPassword: "$2b$10$BzEGKxQQPxLq8HGz3QYaBuum4wNZYztXhOvNOdX5wZvQPVxFIz4Ci",
  email: "superadmin@example.com",
  displayName: "Super Admin",
  role: "superadmin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Thông tin đăng nhập:**

- Username: `superadmin`
- Password: `admin123`

## Cách 3: Tạo Hashed Password

Nếu muốn tạo password riêng, chạy script Node.js này:

```javascript
// createHash.js
const bcrypt = require("bcrypt");

const password = "your_password_here";
const hash = bcrypt.hashSync(password, 10);
console.log("Hashed password:", hash);
```

Chạy:

```bash
node createHash.js
```

## Cách 4: Sử dụng API tạm thời (Development)

Nếu đang phát triển, có thể tạm mở route signup:

1. Mở file `backend/src/routes/authRoute.js`
2. Thêm lại dòng:

```javascript
router.post("/signup", signUp);
```

3. Khởi động lại server
4. Đăng ký một tài khoản
5. Vào MongoDB và đổi role thành "superadmin"
6. Xóa route signup đi

## Sau khi có SuperAdmin

1. Đăng nhập với tài khoản SuperAdmin
2. Truy cập Admin Panel (`/admin`)
3. Click nút "**+ Tạo User Mới**"
4. Điền thông tin và chọn role
5. Click "Tạo User"

## Security Notes

⚠️ **Quan trọng:**

- Đổi password mặc định ngay sau khi tạo
- Không share thông tin SuperAdmin
- Luôn sử dụng password mạnh
- Xóa SuperAdmin test sau khi deploy production
