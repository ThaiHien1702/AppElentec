// Các tùy chọn vị trí
export const POSITIONS = [
  "Manager",
  "Assistant Manager",
  "Supervisor",
  "Staff",
];

// Các tùy chọn vai trò
export const ROLES = ["admin", "moderator", "user"];

// Các loại máy tính
export const COMPUTER_TYPES = ["Desktop", "Laptop", "Workstation", "Server"];

// Trạng thái máy tính
export const COMPUTER_STATUS = [
  "Active",
  "Inactive",
  "Under Maintenance",
  "Retired",
];

// ========== OS (OPERATING SYSTEM) ==========
// Phiên bản hệ điều hành
export const OS_VERSIONS = [
  "Windows 11 Pro",
  "Windows 11 Home",
  "Windows 10 Pro",
  "Windows 10 Home",
  "Windows Server 2022",
  "Windows Server 2019",
  "Windows Server 2016",
  "macOS Ventura",
  "macOS Monterey",
  "macOS Big Sur",
  "Ubuntu 22.04 LTS",
  "Ubuntu 20.04 LTS",
  "Other",
];

// Loại giấy phép OS
export const OS_LICENSE_TYPES = [
  "OEM",
  "Retail",
  "Volume License",
  "Digital License",
  "Enterprise",
];

// ========== MS OFFICE ==========
// Phiên bản MS Office
export const OFFICE_VERSIONS = [
  "Microsoft 365 (Office 365)",
  "Office 2021",
  "Office 2019",
  "Office 2016",
  "Office 2013",
  "None",
];

// Loại giấy phép Office
export const OFFICE_LICENSE_TYPES = [
  "Subscription (Microsoft 365)",
  "OEM",
  "Retail",
  "Volume License",
  "Home & Student",
  "Home & Business",
];

// ========== SOFTWARE ==========
// Danh sách phần mềm có thể cài đặt
export const SOFTWARE_LIST = [
  { name: "AutoCAD", category: "CAD", description: "Phần mềm thiết kế CAD" },
  { name: "NX", category: "CAD/CAM", description: "Phần mềm CAD/CAM/CAE" },
  {
    name: "PowerMill",
    category: "CAM",
    description: "Phần mềm gia công CNC",
  },
  { name: "Mastercam", category: "CAM", description: "Phần mềm CAM" },
  { name: "ZWCAD", category: "CAD", description: "Phần mềm CAD 2D/3D" },
  {
    name: "Symantec",
    category: "Security",
    description: "Phần mềm bảo mật",
  },
];

// Trạng thái phòng ban
export const DEPARTMENT_STATUS = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Vô hiệu hóa" },
];

// Các lớp CSS biểu mẫu
export const FORM_CLASSES = {
  input:
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  select:
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
  label: "block text-sm font-medium text-gray-700 mb-1",
  button: {
    primary:
      "px-3 py-1.5 rounded-md bg-blue-400 text-white hover:bg-blue-500 transition-colors",
    danger:
      "px-3 py-1.5 rounded-md bg-red-400 text-white hover:bg-red-500 transition-colors",
    success:
      "px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors",
  },
};
