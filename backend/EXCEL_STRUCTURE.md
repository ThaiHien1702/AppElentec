# 📊 Computer Management Excel Import/Export

## Cấu trúc File Excel (56 cột)

### **PHẦN 1: INFORMATION (24 cột)**

| Cột | Tên                       | Bắt buộc | Mô tả               | Ví dụ                        |
| --- | ------------------------- | -------- | ------------------- | ---------------------------- |
| 1   | STT                       | ❌       | Số thứ tự (tự động) | 1, 2, 3...                   |
| 2   | Asset Code                | ❌       | Mã tài sản          | ELT-LAP-001, ELT-DES-002     |
| 3   | ID                        | ✅       | Mã nhân viên        | EMP001, EMP002               |
| 4   | Full Name                 | ✅       | Họ tên đầy đủ       | Nguyen Van A                 |
| 5   | Email Address             | ✅       | Email               | name@company.com             |
| 6   | Phone No.                 | ❌       | Số điện thoại       | 0901234567                   |
| 7   | Position                  | ❌       | Chức vụ             | Manager, Staff, Supervisor   |
| 8   | Dept                      | ✅       | Phòng ban           | IT, Design, HR               |
| 9   | IP Address                | ❌       | Địa chỉ IP          | 192.168.1.100                |
| 10  | Mac Address               | ❌       | Địa chỉ MAC         | 00:1A:2B:3C:4D:5E            |
| 11  | Computer Name             | ✅       | Tên máy tính        | LAP-IT-001                   |
| 12  | User Name Pc              | ❌       | Tên user PC         | nvana                        |
| 13  | Desktop / Laptop          | ❌       | Loại máy            | Desktop, Laptop, Workstation |
| 14  | Manufacturer              | ❌       | Hãng sản xuất       | Dell, HP, Lenovo             |
| 15  | Model                     | ❌       | Model               | Latitude 5420, Z2 Tower      |
| 16  | Service tag/Serial number | ❌       | Số serial           | SN001-2024                   |
| 17  | CPU                       | ❌       | Bộ vi xử lý         | Intel Core i7-12700          |
| 18  | RAM                       | ❌       | Ram                 | 16GB, 32GB                   |
| 19  | HDD                       | ❌       | Ổ cứng HDD          | 1TB, 2TB                     |
| 20  | SSD                       | ❌       | Ổ cứng SSD          | 512GB NVMe                   |
| 21  | VGA                       | ❌       | Card màn hình       | NVIDIA RTX 4080              |
| 22  | Other                     | ❌       | Khác                | Docking Station              |
| 23  | Status                    | ❌       | Trạng thái          | Active, Inactive             |
| 24  | Notes                     | ❌       | Ghi chú             | Máy chủ phát triển           |

---

### **PHẦN 2: OS - HỆ ĐIỀU HÀNH (4 cột)**

| Cột | Tên        | Bắt buộc | Mô tả                        | Ví dụ                                 |
| --- | ---------- | -------- | ---------------------------- | ------------------------------------- |
| 25  | Version OS | ❌       | Phiên bản OS                 | Windows 11 Pro, Windows 10 Pro, macOS |
| 26  | OS License | ❌       | Loại license                 | OEM, Retail, Volume License           |
| 27  | OS Key     | ❌       | Product key (sẽ được mã hóa) | WIN11-XXXXX-XXXXX-XXXXX-12345         |
| 28  | OS Note    | ❌       | Ghi chú về OS                | Licensed until 2026                   |

---

### **PHẦN 3: MS OFFICE (4 cột)**

| Cột | Tên            | Bắt buộc | Mô tả                        | Ví dụ                                   |
| --- | -------------- | -------- | ---------------------------- | --------------------------------------- |
| 29  | Version Office | ❌       | Phiên bản Office             | Microsoft 365, Office 2021, Office 2019 |
| 30  | MS License     | ❌       | Loại license                 | Subscription, OEM, Retail               |
| 31  | Office Key     | ❌       | Product key (sẽ được mã hóa) | OFF365-XXXXX-XXXXX-XXXXX-67890          |
| 32  | Office Note    | ❌       | Ghi chú về Office            | Annual subscription                     |

---

### **PHẦN 4: SOFTWARE (24 cột = 6 phần mềm × 4 cột)**

Mỗi phần mềm có 4 cột: Version, License, Key, Note

#### **4.1. AutoCAD (Cột 33-36)**

| Cột | Tên             | Ví dụ                    |
| --- | --------------- | ------------------------ |
| 33  | AutoCAD_Version | 2024, 2023               |
| 34  | AutoCAD_License | Commercial, Educational  |
| 35  | AutoCAD_Key     | ACAD24-XXXXX-XXXXX-XXXXX |
| 36  | AutoCAD_Note    | For design team          |

#### **4.2. NX (Cột 37-40)**

| Cột | Tên        | Ví dụ                  |
| --- | ---------- | ---------------------- |
| 37  | NX_Version | NX 12, NX 2024         |
| 38  | NX_License | Commercial             |
| 39  | NX_Key     | NX12-XXXXX-XXXXX-XXXXX |
| 40  | NX_Note    | CAD/CAM software       |

#### **4.3. PowerMill (Cột 41-44)**

| Cột | Tên               | Ví dụ                  |
| --- | ----------------- | ---------------------- |
| 41  | PowerMill_Version | 2024, 2023             |
| 42  | PowerMill_License | Commercial             |
| 43  | PowerMill_Key     | PM24-XXXXX-XXXXX-XXXXX |
| 44  | PowerMill_Note    | CNC programming        |

#### **4.4. Mastercam (Cột 45-48)**

| Cột | Tên               | Ví dụ                  |
| --- | ----------------- | ---------------------- |
| 45  | Mastercam_Version | 2024                   |
| 46  | Mastercam_License | Commercial             |
| 47  | Mastercam_Key     | MC24-XXXXX-XXXXX-XXXXX |
| 48  | Mastercam_Note    | CAM software           |

#### **4.5. ZWCAD (Cột 49-52)**

| Cột | Tên           | Ví dụ                  |
| --- | ------------- | ---------------------- |
| 49  | ZWCAD_Version | 2024 Pro               |
| 50  | ZWCAD_License | Commercial             |
| 51  | ZWCAD_Key     | ZW24-XXXXX-XXXXX-XXXXX |
| 52  | ZWCAD_Note    | 2D/3D CAD              |

#### **4.6. Symantec (Cột 53-56)**

| Cột | Tên              | Ví dụ                   |
| --- | ---------------- | ----------------------- |
| 53  | Symantec_Version | Endpoint Protection 14  |
| 54  | Symantec_License | Enterprise              |
| 55  | Symantec_Key     | SYM14-XXXXX-XXXXX-XXXXX |
| 56  | Symantec_Note    | Antivirus protection    |

---

## 📝 Quy tắc Import

### **1. Trường bắt buộc:**

- ID (Employee No.)
- Full Name
- Email Address
- Dept
- Computer Name

### **2. Trường tự động:**

- **STT**: Tự động tăng nếu để trống
- **Asset Code**: Có thể nhập thủ công hoặc để trống

### **3. Software:**

- Nếu **bất kỳ cột nào** của software có giá trị → Software được coi là "đã cài đặt"
- Có thể để trống tất cả 4 cột nếu software không cài

### **4. Product Keys:**

- Tất cả Product Keys (OS, Office, Software) sẽ được **tự động mã hóa AES-256** khi import
- Chỉ admin mới có thể xem full keys khi export

### **5. Giá trị mặc định:**

- **Status**: Active (nếu để trống)
- **Desktop / Laptop**: Laptop (nếu để trống)

---

## 🚀 Cách sử dụng

### **A. IMPORT (Nhập dữ liệu từ Excel)**

1. Tải file mẫu Excel từ hệ thống (nút "Tải mẫu Excel")
2. Điền thông tin vào các cột
3. Lưu file Excel
4. Click nút "Import Excel"
5. Chọn file Excel đã điền
6. Hệ thống sẽ:
   - Validate dữ liệu
   - Mã hóa Product Keys
   - Tự động tạo STT
   - Import vào database
   - Báo cáo: số dòng thành công/thất bại

### **B. EXPORT (Xuất dữ liệu ra Excel)**

1. (Optional) Chọn filter: Phòng ban, Trạng thái
2. Click nút "Export Excel"
3. File Excel sẽ tải về với:
   - Tất cả 56 cột
   - **Full Product Keys** (không mask) - chỉ admin
   - Dữ liệu từ database

### **C. TẢI MẪU (Download Template)**

1. Click nút "Tải mẫu Excel"
2. File Excel trống với:
   - 56 cột headers
   - Cột được set width tự động
   - Sẵn sàng để điền dữ liệu

---

## ⚠️ Lưu ý

1. **Product Keys Security:**
   - Keys được mã hóa AES-256 trong database
   - Chỉ admin/IT export được full keys
   - User thông thường chỉ thấy keys dạng masked: `****..XXXXX`

2. **Software Columns:**
   - Chỉ cần điền software đã cài
   - Software không cài để trống tất cả cột
   - Hệ thống tự động convert sang array

3. **Excel Format:**
   - Hỗ trợ: `.xlsx`, `.xls`
   - Không được xóa dòng header
   - Không thay đổi tên cột

4. **Encoding:**
   - Hỗ trợ tiếng Việt có dấu
   - UTF-8 encoding

---

## 📊 Ví dụ Data

### **Máy có đầy đủ thông tin:**

```
STT: 1
Asset Code: ELT-LAP-001
ID: EMP001
Full Name: Nguyen Van A
Email: nguyenvana@company.com
Dept: IT
Computer Name: LAP-IT-001
Version OS: Windows 11 Pro
OS Key: WIN11-XXXXX-XXXXX-XXXXX-12345
Version Office: Microsoft 365
AutoCAD_Version: 2024
AutoCAD_Key: ACAD24-XXXXX-XXXXX-XXXXX
Symantec_Version: Endpoint Protection 14
```

### **Máy chỉ có thông tin cơ bản:**

```
ID: EMP002
Full Name: Tran Thi B
Email: tranthib@company.com
Dept: HR
Computer Name: DES-HR-002
(Các cột khác để trống)
```

---

## 🔐 Security Notes

- **Database**: Keys stored encrypted (AES-256-CBC)
- **List View**: Keys masked (`****...XXXXX`)
- **Detail View**: Keys decrypted (admin only)
- **Export**: Full keys (backup for admin)
- **Import**: Auto-encrypt before save

---

**File Test:** `test-computers-import.xlsx` (2 rows sample data)
**Script:** `test-excel-structure.js`
