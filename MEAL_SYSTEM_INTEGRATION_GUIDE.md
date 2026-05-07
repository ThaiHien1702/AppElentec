# Hướng Dẫn Tích Hợp Hệ Thống Quản Lý Xuất Ăn

## 1. Backend Setup

### 1.1 Cấu trúc Thư Mục Backend

```
backend/
├── src/
│   ├── models/
│   │   ├── Meal.js (MỚI)
│   │   ├── MealDistribution.js (MỚI)
│   │   ├── MealInventory.js (MỚI)
│   ├── controllers/
│   │   ├── mealController.js (MỚI)
│   │   ├── mealDistributionController.js (MỚI)
│   │   ├── mealInventoryController.js (MỚI)
│   ├── routes/
│   │   ├── mealRoutes.js (MỚI)
│   │   ├── mealDistributionRoutes.js (MỚI)
│   │   ├── mealInventoryRoutes.js (MỚI)
```

### 1.2 Tích Hợp Routes vào Server

**Trong file `backend/src/server.js`, thêm:**

```javascript
// Meal Management Routes
const mealRoutes = require("./routes/mealRoutes");
const mealDistributionRoutes = require("./routes/mealDistributionRoutes");
const mealInventoryRoutes = require("./routes/mealInventoryRoutes");

// Áp dụng routes
app.use("/api/meals", mealRoutes);
app.use("/api/distributions", mealDistributionRoutes);
app.use("/api/inventory", mealInventoryRoutes);
```

### 1.3 Khởi Tạo Cơ Sở Dữ Liệu

**Trong file `backend/src/server.js` hoặc file khởi động, gọi:**

```javascript
const Meal = require("./models/Meal");
const MealDistribution = require("./models/MealDistribution");
const MealInventory = require("./models/MealInventory");

// Khởi tạo các bảng
Promise.all([
  Meal.createTable(),
  MealDistribution.createTable(),
  MealInventory.createTable(),
])
  .then(() => {
    console.log("Meal management tables created");
  })
  .catch((err) => {
    console.error("Error creating tables:", err);
  });
```

### 1.4 Middleware Xác Thực

Các controller đã kiểm tra `req.user.role`. Đảm bảo authMiddleware cung cấp:

- `req.user.id` - ID người dùng
- `req.user.role` - Vai trò (admin, canteen_manager, department_manager, employee, accounting)

**Các vai trò được phép:**

- **Admin**: Toàn quyền
- **Canteen Manager**: Quản lý suất ăn, tồn kho
- **Department Manager**: Tạo xuất ăn cho nhân viên
- **Employee**: Xem xuất ăn cá nhân
- **Accounting**: Xem báo cáo

---

## 2. Frontend Setup

### 2.1 Cấu Trúc Thư Mục Frontend

```
frontend/
├── src/
│   ├── components/
│   │   └── MealManagement/
│   │       ├── MealList.jsx (MỚI)
│   │       ├── MealForm.jsx (MỚI)
│   │       ├── MealDistributionForm.jsx (MỚI)
│   │       ├── MealDistributionList.jsx (MỚI)
│   │       ├── MealReports.jsx (MỚI)
│   │       ├── MealInventory.jsx (MỚI)
│   │       └── *.css (MỚI)
│   ├── pages/
│   │   └── MealManagement/
│   │       ├── MealManagementPage.jsx (MỚI)
│   │       ├── MealDistributionPage.jsx (MỚI)
│   │       ├── MealReportsPage.jsx (MỚI)
│   │       └── *.css (MỚI)
│   ├── utils/
│   │   └── mealManagementService.js (MỚI)
```

### 2.2 Cấu Hình API Base URL

**Trong file `frontend/src/utils/mealManagementService.js`, đảm bảo:**

```javascript
const API_BASE_URL = "/api/meals";
const DISTRIBUTION_URL = "/api/distributions";
const INVENTORY_URL = "/api/inventory";
```

### 2.3 Tích Hợp Routes vào React Router

**Trong file routing chính (VD: App.jsx), thêm:**

```javascript
import MealManagementPage from './pages/MealManagement/MealManagementPage';
import MealDistributionPage from './pages/MealManagement/MealDistributionPage';
import MealReportsPage from './pages/MealManagement/MealReportsPage';

// Trong routes configuration
<Route path="/meal-management" element={<MealManagementPage />} />
<Route path="/meal-distribution" element={<MealDistributionPage />} />
<Route path="/meal-reports" element={<MealReportsPage />} />
```

### 2.4 Cấu Hình Navigation Menu

**Thêm vào menu chính:**

```jsx
<NavLink to="/meal-management">Quản lý suất ăn</NavLink>
<NavLink to="/meal-distribution">Quản lý xuất ăn</NavLink>
<NavLink to="/meal-reports">Báo cáo & Thống kê</NavLink>
```

---

## 3. Sử Dụng Components

### 3.1 MealList Component

```jsx
import MealList from '@/components/MealManagement/MealList';

// Hiển thị danh sách với các hành động
<MealList showActions={true} />

// Lấy danh sách cho selector
<MealList
  onSelectMeal={(meal) => console.log(meal)}
  showActions={false}
/>
```

### 3.2 MealForm Component

```jsx
import MealForm from '@/components/MealManagement/MealForm';

// Tạo suất ăn mới
<MealForm onSuccess={() => console.log('Success')} />

// Chỉnh sửa suất ăn
<MealForm mealId={123} onSuccess={() => console.log('Updated')} />
```

### 3.3 MealDistributionForm Component

```jsx
import MealDistributionForm from "@/components/MealManagement/MealDistributionForm";

<MealDistributionForm onSuccess={() => console.log("Created")} />;
```

### 3.4 MealDistributionList Component

```jsx
import MealDistributionList from '@/components/MealManagement/MealDistributionList';

// Danh sách tất cả
<MealDistributionList />

// Với filters
<MealDistributionList filters={{ employee_id: 123 }} />
```

### 3.5 MealReports Component

```jsx
import MealReports from "@/components/MealManagement/MealReports";

<MealReports />;
```

### 3.6 MealInventory Component

```jsx
import MealInventory from "@/components/MealManagement/MealInventory";

<MealInventory />;
```

---

## 4. API Endpoints Reference

### 4.1 Suất Ăn (Meals)

```
GET    /api/meals?category=&status=&search=              # Danh sách
GET    /api/meals/:id                                     # Chi tiết
GET    /api/meals/category/:category                      # Theo danh mục
POST   /api/meals                                          # Tạo mới
PUT    /api/meals/:id                                      # Cập nhật
PUT    /api/meals/:id/status                              # Cập nhật trạng thái
DELETE /api/meals/:id                                      # Xóa
```

### 4.2 Xuất Ăn (Distributions)

```
GET    /api/distributions?date=&employee_id=&department_id=&status=  # Danh sách
GET    /api/distributions/:id                             # Chi tiết
GET    /api/distributions/by-employee/:empId/:date        # Nhân viên/ngày
GET    /api/distributions/stats/date/:date                # Thống kê ngày
GET    /api/distributions/stats/month/:year/:month        # Thống kê tháng
GET    /api/distributions/stats/department                # Thống kê phòng ban
POST   /api/distributions                                  # Tạo mới
PUT    /api/distributions/:id                             # Cập nhật
PUT    /api/distributions/:id/confirm                     # Xác nhận
PUT    /api/distributions/:id/status                      # Cập nhật trạng thái
DELETE /api/distributions/:id                             # Xóa
```

### 4.3 Tồn Kho (Inventory)

```
GET    /api/inventory                                      # Danh sách
GET    /api/inventory/:id                                  # Chi tiết
GET    /api/inventory/low-stock                           # Tồn kho thấp
GET    /api/inventory/available/:mealId                   # Số lượng có sẵn
POST   /api/inventory                                      # Tạo mới
PUT    /api/inventory/:id                                  # Cập nhật
POST   /api/inventory/:id/import                          # Nhập kho
POST   /api/inventory/:id/export                          # Xuất kho
DELETE /api/inventory/:id                                  # Xóa
```

---

## 5. Dữ Liệu Request/Response

### 5.1 Tạo Suất Ăn

**Request:**

```json
{
  "code": "COM001",
  "name": "Cơm tấm",
  "description": "Cơm tấm với sườn cơm",
  "price": 50000,
  "category": "Com",
  "supplier_id": 1,
  "status": "available",
  "start_time": "11:00",
  "end_time": "13:00"
}
```

**Response:**

```json
{
  "success": true,
  "data": { "id": 1 },
  "message": "Tạo suất ăn thành công"
}
```

### 5.2 Tạo Xuất Ăn

**Request:**

```json
{
  "employee_id": 123,
  "meal_id": 1,
  "quantity": 1,
  "distribution_date": "2026-05-07",
  "distribution_time": "12:00",
  "notes": "Ghi chú"
}
```

**Response:**

```json
{
  "success": true,
  "data": { "id": 1 },
  "message": "Tạo xuất ăn thành công"
}
```

### 5.3 Nhập Kho

**Request:**

```json
{
  "quantity": 50
}
```

**Response:**

```json
{
  "success": true,
  "message": "Nhập kho thành công"
}
```

---

## 6. Quyền Hạn (Role-based Access)

| Hành động        | Admin | Canteen Manager | Dept Manager | Employee | Accounting |
| ---------------- | ----- | --------------- | ------------ | -------- | ---------- |
| Xem suất ăn      | ✓     | ✓               | ✓            | ✓        | ✓          |
| Tạo suất ăn      | ✓     | ✓               | ✗            | ✗        | ✗          |
| Sửa suất ăn      | ✓     | ✓               | ✗            | ✗        | ✗          |
| Xóa suất ăn      | ✓     | ✗               | ✗            | ✗        | ✗          |
| Xem xuất ăn      | ✓     | ✓               | ✓            | ✓        | ✓          |
| Tạo xuất ăn      | ✓     | ✓               | ✓            | ✗        | ✗          |
| Xác nhận xuất ăn | ✓     | ✓               | ✓            | ✗        | ✗          |
| Xem tồn kho      | ✓     | ✓               | ✗            | ✗        | ✓          |
| Cập nhật tồn kho | ✓     | ✓               | ✗            | ✗        | ✗          |
| Xem báo cáo      | ✓     | ✓               | ✓            | ✗        | ✓          |

---

## 7. Troubleshooting

### 7.1 Lỗi 403 Forbidden

**Nguyên nhân**: Người dùng không có quyền thực hiện hành động  
**Giải pháp**: Kiểm tra `req.user.role` và đảm bảo người dùng có vai trò phù hợp

### 7.2 Lỗi kết nối API

**Nguyên nhân**: API server không chạy hoặc URL sai  
**Giải pháp**:

- Kiểm tra backend server có chạy
- Kiểm tra API_BASE_URL trong mealManagementService.js

### 7.3 Dữ liệu không load

**Nguyên nhân**: Thiếu token hoặc authMiddleware  
**Giải pháp**:

- Đảm bảo authMiddleware được áp dụng cho tất cả routes
- Kiểm tra token xác thực có valid

### 7.4 CSS không hiển thị

**Nguyên nhân**: File CSS không được import  
**Giải pháp**:

- Kiểm tra import CSS trong components
- Đảm bảo đường dẫn file CSS chính xác

---

## 8. Bước Tiếp Theo (Future Enhancements)

1. **Thêm Excel Export** - Xuất báo cáo sang Excel format
2. **Email Notifications** - Gửi thông báo qua email
3. **Mobile App** - Ứng dụng mobile cho quản lý xuất ăn
4. **Advanced Analytics** - Phân tích nâng cao, AI recommendations
5. **Integration** - Tích hợp với các hệ thống khác

---

**Cập nhật**: 2026-05-07  
**Phiên bản**: 1.0
