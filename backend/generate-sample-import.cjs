const XLSX = require("xlsx");

// Generate 10 sample computer records
const sampleData = [
  {
    "Employee No.": "EMP001",
    "Email Address": "nguyenvana@company.com",
    "Phone No.": "0901234001",
    "User Name": "Nguyễn Văn A",
    Position: "IT Staff",
    Dept: "IT",
    "IP Address": "192.168.1.101",
    "MAC Address": "00:1A:2B:3C:4D:01",
    "Computer Name": "PC-EMP001",
    "User Name Pc": "nvana",
    Categories: "Desktop",
    Manufacturer: "Dell",
    "Service tag/Serial number": "ST001-2024",
    "System Model": "OptiPlex 7090",
    CPU: "Intel Core i5-12400",
    RAM: "16GB",
    HDD: "",
    SSD: "512GB NVMe",
    VGA: "Intel UHD Graphics 730",
    Other: "Dual Monitor Setup",
    Status: "Active",
    Notes: "Máy trạm chính IT",
  },
  {
    "Employee No.": "EMP002",
    "Email Address": "tranthib@company.com",
    "Phone No.": "0901234002",
    "User Name": "Trần Thị B",
    Position: "Accountant",
    Dept: "Finance",
    "IP Address": "192.168.1.102",
    "MAC Address": "00:1A:2B:3C:4D:02",
    "Computer Name": "PC-EMP002",
    "User Name Pc": "ttbinhb",
    Categories: "Desktop",
    Manufacturer: "HP",
    "Service tag/Serial number": "ST002-2023",
    "System Model": "EliteDesk 800 G6",
    CPU: "Intel Core i7-10700",
    RAM: "32GB",
    HDD: "",
    SSD: "1TB NVMe",
    VGA: "NVIDIA GeForce GTX 1660",
    Other: "",
    Status: "Active",
    Notes: "Máy xử lý dữ liệu tài chính",
  },
  {
    "Employee No.": "EMP003",
    "Email Address": "levanc@company.com",
    "Phone No.": "0901234003",
    "User Name": "Lê Văn C",
    Position: "HR Manager",
    Dept: "HR",
    "IP Address": "192.168.1.103",
    "MAC Address": "00:1A:2B:3C:4D:03",
    "Computer Name": "PC-EMP003",
    "User Name Pc": "lvanc",
    Categories: "Laptop",
    Manufacturer: "Lenovo",
    "Service tag/Serial number": "ST003-2024",
    "System Model": "ThinkPad T14",
    CPU: "AMD Ryzen 5 5600U",
    RAM: "16GB",
    HDD: "",
    SSD: "512GB",
    VGA: "AMD Radeon Graphics",
    Other: "Docking Station",
    Status: "Active",
    Notes: "Máy văn phòng",
  },
  {
    "Employee No.": "EMP004",
    "Email Address": "phamthid@company.com",
    "Phone No.": "0901234004",
    "User Name": "Phạm Thị D",
    Position: "Marketing Staff",
    Dept: "Marketing",
    "IP Address": "192.168.1.104",
    "MAC Address": "00:1A:2B:3C:4D:04",
    "Computer Name": "PC-EMP004",
    "User Name Pc": "pthid",
    Categories: "Desktop",
    Manufacturer: "ASUS",
    "Service tag/Serial number": "ST004-2022",
    "System Model": "D500SA",
    CPU: "Intel Core i3-10100",
    RAM: "8GB",
    HDD: "500GB",
    SSD: "",
    VGA: "Intel UHD Graphics 630",
    Other: "",
    Status: "Under Maintenance",
    Notes: "Cần nâng cấp RAM",
  },
  {
    "Employee No.": "EMP005",
    "Email Address": "hoangvane@company.com",
    "Phone No.": "0901234005",
    "User Name": "Hoàng Văn E",
    Position: "Senior Developer",
    Dept: "IT",
    "IP Address": "192.168.1.105",
    "MAC Address": "00:1A:2B:3C:4D:05",
    "Computer Name": "PC-EMP005",
    "User Name Pc": "hvane",
    Categories: "Workstation",
    Manufacturer: "Dell",
    "Service tag/Serial number": "ST005-2024",
    "System Model": "Precision 7920",
    CPU: "Intel Core i9-13900K",
    RAM: "64GB",
    HDD: "",
    SSD: "2TB NVMe",
    VGA: "NVIDIA RTX 4080",
    Other: "3 Monitors, Mechanical Keyboard",
    Status: "Active",
    Notes: "Máy chủ phát triển",
  },
  {
    "Employee No.": "EMP006",
    "Email Address": "vuthif@company.com",
    "Phone No.": "0901234006",
    "User Name": "Vũ Thị F",
    Position: "Sales Representative",
    Dept: "Sales",
    "IP Address": "192.168.1.106",
    "MAC Address": "00:1A:2B:3C:4D:06",
    "Computer Name": "PC-EMP006",
    "User Name Pc": "vuthif",
    Categories: "Laptop",
    Manufacturer: "HP",
    "Service tag/Serial number": "ST006-2023",
    "System Model": "ProBook 450 G9",
    CPU: "Intel Core i5-1235U",
    RAM: "16GB",
    HDD: "",
    SSD: "512GB",
    VGA: "Intel Iris Xe Graphics",
    Other: "Carrying Case",
    Status: "Active",
    Notes: "Máy bán hàng online",
  },
  {
    "Employee No.": "EMP007",
    "Email Address": "dangvang@company.com",
    "Phone No.": "0901234007",
    "User Name": "Đặng Văn G",
    Position: "Graphic Designer",
    Dept: "Design",
    "IP Address": "192.168.1.107",
    "MAC Address": "00:1A:2B:3C:4D:07",
    "Computer Name": "PC-EMP007",
    "User Name Pc": "dvang",
    Categories: "Desktop",
    Manufacturer: "Lenovo",
    "Service tag/Serial number": "ST007-2024",
    "System Model": "Legion T5",
    CPU: "AMD Ryzen 7 5800X",
    RAM: "32GB",
    HDD: "",
    SSD: "1TB NVMe",
    VGA: "NVIDIA RTX 3070",
    Other: "Wacom Tablet, Color Calibrator",
    Status: "Active",
    Notes: "Máy đồ họa cao cấp",
  },
  {
    "Employee No.": "EMP008",
    "Email Address": "buithih@company.com",
    "Phone No.": "0901234008",
    "User Name": "Bùi Thị H",
    Position: "Logistics Coordinator",
    Dept: "Logistics",
    "IP Address": "192.168.1.108",
    "MAC Address": "00:1A:2B:3C:4D:08",
    "Computer Name": "PC-EMP008",
    "User Name Pc": "buithih",
    Categories: "Desktop",
    Manufacturer: "Acer",
    "Service tag/Serial number": "ST008-2021",
    "System Model": "Veriton M200",
    CPU: "Intel Core i5-9400",
    RAM: "8GB",
    HDD: "",
    SSD: "256GB",
    VGA: "Intel UHD Graphics 630",
    Other: "",
    Status: "Retired",
    Notes: "Máy cũ - Chờ thanh lý",
  },
  {
    "Employee No.": "EMP009",
    "Email Address": "ngovani@company.com",
    "Phone No.": "0901234009",
    "User Name": "Ngô Văn I",
    Position: "Research Scientist",
    Dept: "R&D",
    "IP Address": "192.168.1.109",
    "MAC Address": "00:1A:2B:3C:4D:09",
    "Computer Name": "PC-EMP009",
    "User Name Pc": "nvani",
    Categories: "Workstation",
    Manufacturer: "Dell",
    "Service tag/Serial number": "ST009-2024",
    "System Model": "Precision 5820",
    CPU: "Intel Core i7-12700",
    RAM: "32GB",
    HDD: "",
    SSD: "1TB NVMe",
    VGA: "NVIDIA RTX 3060",
    Other: "GPU Server Access",
    Status: "Active",
    Notes: "Máy nghiên cứu AI",
  },
  {
    "Employee No.": "EMP010",
    "Email Address": "lythik@company.com",
    "Phone No.": "0901234010",
    "User Name": "Lý Thị K",
    Position: "Customer Support",
    Dept: "Customer Support",
    "IP Address": "192.168.1.110",
    "MAC Address": "00:1A:2B:3C:4D:10",
    "Computer Name": "PC-EMP010",
    "User Name Pc": "lythik",
    Categories: "Desktop",
    Manufacturer: "HP",
    "Service tag/Serial number": "ST010-2023",
    "System Model": "EliteDesk 800 G8",
    CPU: "Intel Core i5-11500",
    RAM: "16GB",
    HDD: "",
    SSD: "512GB",
    VGA: "Intel UHD Graphics 750",
    Other: "Headset with Mic",
    Status: "Active",
    Notes: "Máy hỗ trợ khách hàng",
  },
];

// Create workbook and worksheet
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths to match template
ws["!cols"] = [
  { wch: 12 }, // Employee No.
  { wch: 25 }, // Email Address
  { wch: 12 }, // Phone No.
  { wch: 20 }, // User Name
  { wch: 18 }, // Position
  { wch: 18 }, // Dept
  { wch: 15 }, // IP Address
  { wch: 18 }, // MAC Address
  { wch: 15 }, // Computer Name
  { wch: 15 }, // User Name Pc
  { wch: 12 }, // Categories
  { wch: 15 }, // Manufacturer
  { wch: 25 }, // Service tag/Serial number
  { wch: 18 }, // System Model
  { wch: 22 }, // CPU
  { wch: 10 }, // RAM
  { wch: 10 }, // HDD
  { wch: 12 }, // SSD
  { wch: 25 }, // VGA
  { wch: 30 }, // Other
  { wch: 12 }, // Status
  { wch: 30 }, // Notes
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Computers");

// Write to file
const fileName = "sample-computers-import.xlsx";
XLSX.writeFile(wb, fileName);

console.log(`✓ Created ${fileName} with 10 sample computer records`);
console.log("\nSample data includes:");
console.log(
  "- 10 employees from different departments (IT, Finance, HR, Marketing, Sales, Design, R&D, etc.)",
);
console.log(
  "- Various statuses: Active (7), Under Maintenance (1), Retired (2)",
);
console.log("- Mixed hardware: Intel/AMD CPUs, Desktop/Laptop/Workstation");
console.log("- Manufacturers: Dell, HP, Lenovo, ASUS, Acer");
console.log("- Years: 2021-2024");
console.log("\n📝 Headers match the API template exactly");
console.log("🚀 Ready to import via: POST /api/computers/import");
