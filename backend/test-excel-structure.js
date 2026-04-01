import XLSX from "xlsx";
import fs from "fs";

// Test data
const testData = [
  {
    // Information
    STT: 1,
    "Asset Code": "ELT-LAP-001",
    ID: "EMP001",
    "Full Name": "Nguyen Van A",
    "Email Address": "nguyenvana@elentec.com",
    "Phone No.": "0901234567",
    Position: "Manager",
    Dept: "IT",
    "IP Address": "192.168.1.100",
    "Mac Address": "00:1A:2B:3C:4D:5E",
    "Computer Name": "LAP-IT-001",
    "User Name Pc": "nvana",
    "Desktop / Laptop": "Laptop",
    Manufacturer: "Dell",
    Model: "Latitude 5420",
    "Service tag/Serial number": "SN001-2024",
    CPU: "Intel Core i7-12700",
    RAM: "32GB",
    HDD: "",
    SSD: "512GB NVMe",
    VGA: "Intel Iris Xe",
    Other: "Docking Station",
    Status: "Active",
    Notes: "Máy chủ IT Department",
    // OS
    "Version OS": "Windows 11 Pro",
    "OS License": "Volume License",
    "OS Key": "WIN11-XXXXX-XXXXX-XXXXX-12345",
    "OS Note": "Licensed until 2026",
    // Office
    "Version Office": "Microsoft 365 (Office 365)",
    "MS License": "Subscription (Microsoft 365)",
    "Office Key": "OFF365-XXXXX-XXXXX-XXXXX-67890",
    "Office Note": "Annual subscription",
    // Software - AutoCAD
    AutoCAD_Version: "2024",
    AutoCAD_License: "Commercial",
    AutoCAD_Key: "ACAD24-XXXXX-XXXXX-XXXXX-ABCDE",
    AutoCAD_Note: "For design team",
    // Software - Symantec
    Symantec_Version: "Endpoint Protection 14",
    Symantec_License: "Enterprise",
    Symantec_Key: "SYM14-XXXXX-XXXXX-XXXXX-FGHIJ",
    Symantec_Note: "Antivirus protection",
    // Empty software (not installed)
    NX_Version: "",
    NX_License: "",
    NX_Key: "",
    NX_Note: "",
    PowerMill_Version: "",
    PowerMill_License: "",
    PowerMill_Key: "",
    PowerMill_Note: "",
    Mastercam_Version: "",
    Mastercam_License: "",
    Mastercam_Key: "",
    Mastercam_Note: "",
    ZWCAD_Version: "",
    ZWCAD_License: "",
    ZWCAD_Key: "",
    ZWCAD_Note: "",
  },
  {
    // Information
    STT: 2,
    "Asset Code": "ELT-DES-002",
    ID: "EMP002",
    "Full Name": "Tran Thi B",
    "Email Address": "tranthib@elentec.com",
    "Phone No.": "0901234568",
    Position: "Staff",
    Dept: "Design",
    "IP Address": "192.168.1.101",
    "Mac Address": "00:1A:2B:3C:4D:5F",
    "Computer Name": "DES-DESIGN-002",
    "User Name Pc": "ttb",
    "Desktop / Laptop": "Desktop",
    Manufacturer: "HP",
    Model: "Z2 Tower G9",
    "Service tag/Serial number": "SN002-2024",
    CPU: "Intel Core i9-13900K",
    RAM: "64GB",
    HDD: "2TB",
    SSD: "1TB NVMe",
    VGA: "NVIDIA RTX 4080",
    Other: "Dual 27 monitors",
    Status: "Active",
    Notes: "Workstation cho thiết kế",
    // OS
    "Version OS": "Windows 10 Pro",
    "OS License": "OEM",
    "OS Key": "WIN10-XXXXX-XXXXX-XXXXX-98765",
    "OS Note": "",
    // Office
    "Version Office": "Office 2021",
    "MS License": "Retail",
    "Office Key": "OFF21-XXXXX-XXXXX-XXXXX-13579",
    "Office Note": "Perpetual license",
    // Software - NX, PowerMill, ZWCAD installed
    AutoCAD_Version: "",
    AutoCAD_License: "",
    AutoCAD_Key: "",
    AutoCAD_Note: "",
    NX_Version: "NX 12",
    NX_License: "Commercial",
    NX_Key: "NX12-XXXXX-XXXXX-XXXXX-KLMNO",
    NX_Note: "CAD/CAM software",
    PowerMill_Version: "2024",
    PowerMill_License: "Commercial",
    PowerMill_Key: "PM24-XXXXX-XXXXX-XXXXX-PQRST",
    PowerMill_Note: "CNC programming",
    Mastercam_Version: "",
    Mastercam_License: "",
    Mastercam_Key: "",
    Mastercam_Note: "",
    ZWCAD_Version: "2024 Pro",
    ZWCAD_License: "Commercial",
    ZWCAD_Key: "ZW24-XXXXX-XXXXX-XXXXX-UVWXY",
    ZWCAD_Note: "2D/3D CAD",
    Symantec_Version: "Endpoint Protection 14",
    Symantec_License: "Enterprise",
    Symantec_Key: "SYM14-XXXXX-XXXXX-XXXXX-ZABCD",
    Symantec_Note: "",
  },
];

console.log("=== Testing Excel Import/Export Structure ===\n");

// Create workbook
const worksheet = XLSX.utils.json_to_sheet(testData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Computers");

// Set column widths
const colWidths = [
  { wch: 6 }, // STT
  { wch: 16 }, // Asset Code
  { wch: 14 }, // ID
  { wch: 20 }, // Full Name
  { wch: 28 }, // Email
  { wch: 16 }, // Phone
  { wch: 18 }, // Position
  { wch: 12 }, // Dept
  { wch: 16 }, // IP
  { wch: 20 }, // MAC
  { wch: 20 }, // Computer Name
  { wch: 16 }, // User Name PC
  { wch: 16 }, // Desktop/Laptop
  { wch: 16 }, // Manufacturer
  { wch: 20 }, // Model
  { wch: 24 }, // Service Tag
  { wch: 24 }, // CPU
  { wch: 12 }, // RAM
  { wch: 12 }, // HDD
  { wch: 12 }, // SSD
  { wch: 18 }, // VGA
  { wch: 20 }, // Other
  { wch: 14 }, // Status
  { wch: 30 }, // Notes
  { wch: 20 }, // Version OS
  { wch: 16 }, // OS License
  { wch: 30 }, // OS Key
  { wch: 20 }, // OS Note
  { wch: 24 }, // Version Office
  { wch: 18 }, // MS License
  { wch: 30 }, // Office Key
  { wch: 20 }, // Office Note
];

// Add software columns (4 per software × 6 = 24 columns)
for (let i = 0; i < 24; i++) {
  colWidths.push(i % 4 === 2 ? { wch: 30 } : { wch: 16 });
}

worksheet["!cols"] = colWidths;

// Write to file
const filename = "test-computers-import.xlsx";
XLSX.writeFile(workbook, filename);

console.log(`✅ Created test Excel file: ${filename}`);
console.log(`📊 Total columns: ${Object.keys(testData[0]).length}`);
console.log(`📝 Total rows: ${testData.length}`);
console.log();

// Read back and verify
const readWorkbook = XLSX.readFile(filename);
const readWorksheet = readWorkbook.Sheets[readWorkbook.SheetNames[0]];
const readData = XLSX.utils.sheet_to_json(readWorksheet);

console.log("=== Verifying Data ===");
console.log(`✅ Read back ${readData.length} rows`);
console.log();

// Check first row
const firstRow = readData[0];
console.log("First row data:");
console.log(`  - STT: ${firstRow.STT}`);
console.log(`  - Asset Code: ${firstRow["Asset Code"]}`);
console.log(`  - ID: ${firstRow.ID}`);
console.log(`  - Full Name: ${firstRow["Full Name"]}`);
console.log(`  - Email: ${firstRow["Email Address"]}`);
console.log(`  - OS Version: ${firstRow["Version OS"]}`);
console.log(`  - OS Key: ${firstRow["OS Key"]}`);
console.log(`  - Office Version: ${firstRow["Version Office"]}`);
console.log(
  `  - AutoCAD Version: ${firstRow.AutoCAD_Version || "(not installed)"}`,
);
console.log(
  `  - Symantec Version: ${firstRow.Symantec_Version || "(not installed)"}`,
);
console.log();

// Check second row
const secondRow = readData[1];
console.log("Second row data:");
console.log(`  - STT: ${secondRow.STT}`);
console.log(`  - Asset Code: ${secondRow["Asset Code"]}`);
console.log(`  - Full Name: ${secondRow["Full Name"]}`);
console.log(`  - NX Version: ${secondRow.NX_Version || "(not installed)"}`);
console.log(
  `  - PowerMill Version: ${secondRow.PowerMill_Version || "(not installed)"}`,
);
console.log(
  `  - ZWCAD Version: ${secondRow.ZWCAD_Version || "(not installed)"}`,
);
console.log();

console.log("=== Test Complete ===");
console.log(`✅ File created successfully: ${filename}`);
console.log("You can now use this file to test the import API endpoint.");
