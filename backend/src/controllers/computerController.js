import ComputerInfo from "../models/ComputerInfo.js";
import XLSX from "xlsx";
import ExcelJS from "exceljs";
import { hasPermission } from "../utils/positionHierarchy.js";
import {
  encryptComputerKeys,
  decryptComputerKeys,
} from "../utils/encryption.js";

const FIELD_ALIASES = {
  stt: ["No.", "No", "STT", "stt"],
  assetCode: ["Asset Code", "assetCode"],
  employeeNo: ["Employee No.", "Employee No", "ID", "employeeNo"],
  email: ["Email Address", "Email", "email"],
  phone: ["Phone No.", "Phone No", "Phone", "phone"],
  userName: ["User Name", "Full Name", "userName"],
  position: ["Position", "position"],
  department: ["Dept", "Department", "department"],
  ipAddress: ["IP Address", "ipAddress"],
  macAddress: ["MAC Address", "Mac Address", "macAddress"],
  computerName: ["Computer Name", "computerName"],
  userNamePc: ["User Name Pc", "Username PC", "userNamePc"],
  categories: ["Categories", "Category", "Desktop / Laptop", "categories"],
  manufacturer: ["Manufacturer", "manufacturer"],
  serviceTag: [
    "Service tag/Serial number",
    "Service tag",
    "Serial number",
    "serviceTag",
  ],
  systemModel: ["System Model", "Model", "systemModel"],
  cpu: ["CPU", "cpu"],
  ram: ["RAM", "ram"],
  hdd: ["HDD", "hdd"],
  ssd: ["SSD", "ssd"],
  vga: ["VGA", "vga"],
  other: ["Other", "other"],
  status: ["Status", "status"],
  notes: ["Notes", "Ghi chú", "notes"],
  // OS fields
  osVersion: ["OS Version", "Version OS", "osVersion"],
  osLicense: ["OS License", "osLicense"],
  osKey: ["OS Key", "osKey"],
  osNote: ["OS Note", "osNote"],
  // Office fields
  officeVersion: ["Office Version", "Version Office", "officeVersion"],
  officeLicense: ["Office License", "MS License", "officeLicense"],
  officeKey: ["Office Key", "officeKey"],
  officeNote: ["Office Note", "officeNote"],
};

// Software list for Excel import/export
const SOFTWARE_LIST = [
  "AutoCAD",
  "NX",
  "PowerMill",
  "Mastercam",
  "ZWCAD",
  "Symantec",
];

const normalizeCellValue = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const normalizeHeaderKey = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[._]/g, " ")
    .replace(/\s+/g, " ");

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildComputerFilters = ({ department, status }) => {
  const filter = {};
  const normalizedDepartment = normalizeCellValue(department);
  const normalizedStatus = normalizeCellValue(status);

  if (normalizedDepartment) {
    filter.department = new RegExp(
      `^\\s*${escapeRegex(normalizedDepartment)}\\s*$`,
      "i",
    );
  }

  if (normalizedStatus) {
    filter.status = new RegExp(
      `^\\s*${escapeRegex(normalizedStatus)}\\s*$`,
      "i",
    );
  }

  return filter;
};

const pickFieldValue = (row, aliases) => {
  const normalizedAliases = aliases.map((alias) => normalizeHeaderKey(alias));

  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(row, alias)) {
      return normalizeCellValue(row[alias]);
    }
  }

  for (const [header, value] of Object.entries(row)) {
    if (normalizedAliases.includes(normalizeHeaderKey(header))) {
      return normalizeCellValue(value);
    }
  }

  return "";
};

const mapExcelRowToComputerPayload = (row) => {
  const payload = {};

  // Map basic fields
  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    payload[field] = pickFieldValue(row, aliases);
  });

  // Parse installed software from Excel columns
  const installedSoftware = [];
  SOFTWARE_LIST.forEach((softwareName) => {
    const version = pickFieldValue(row, [
      `${softwareName}_Version`,
      `${softwareName} Version`,
    ]);
    const license = pickFieldValue(row, [
      `${softwareName}_License`,
      `${softwareName} License`,
    ]);
    const key = pickFieldValue(row, [
      `${softwareName}_Key`,
      `${softwareName} Key`,
    ]);
    const note = pickFieldValue(row, [
      `${softwareName}_Note`,
      `${softwareName} Note`,
    ]);

    // If any field has value, consider software as installed
    if (version || license || key || note) {
      installedSoftware.push({
        name: softwareName,
        version: version || "",
        license: license || "",
        key: key || "",
        note: note || "",
      });
    }
  });

  if (installedSoftware.length > 0) {
    payload.installedSoftware = installedSoftware;
  }

  // Set defaults
  if (!payload.status) {
    payload.status = "Active";
  }
  if (!payload.categories) {
    payload.categories = "Laptop";
  }
  if (!payload.position) {
    payload.position = "Staff";
  }

  return payload;
};

const EXCEL_HEADERS = [
  // Part 1: Computer Information
  "No.",
  "Asset Code",
  "Computer Name",
  "User Name Pc",
  "Desktop / Laptop",
  "Manufacturer",
  "Model",
  "Service tag/Serial number",
  "IP Address",
  "Mac Address",
  "CPU",
  "RAM",
  "HDD",
  "SSD",
  "VGA",
  "Other",
  "Status",
  "Notes",
  // Part 2: User Information
  "ID",
  "Full Name",
  "Email Address",
  "Phone No.",
  "Position",
  "Dept",
  // Part 3: OS
  "Version OS",
  "OS License",
  "OS Key",
  "OS Note",
  // Part 4: MS Office
  "Version Office",
  "MS License",
  "Office Key",
  "Office Note",
  // Part 5: Software - AutoCAD
  "AutoCAD_Version",
  "AutoCAD_License",
  "AutoCAD_Key",
  "AutoCAD_Note",
  // NX
  "NX_Version",
  "NX_License",
  "NX_Key",
  "NX_Note",
  // PowerMill
  "PowerMill_Version",
  "PowerMill_License",
  "PowerMill_Key",
  "PowerMill_Note",
  // Mastercam
  "Mastercam_Version",
  "Mastercam_License",
  "Mastercam_Key",
  "Mastercam_Note",
  // ZWCAD
  "ZWCAD_Version",
  "ZWCAD_License",
  "ZWCAD_Key",
  "ZWCAD_Note",
  // Symantec
  "Symantec_Version",
  "Symantec_License",
  "Symantec_Key",
  "Symantec_Note",
];

const EXCEL_WIDTH_BY_HEADER = {
  "No.": 8,
  "Asset Code": 16,
  "Computer Name": 22,
  "User Name Pc": 18,
  "Desktop / Laptop": 18,
  Manufacturer: 18,
  Model: 20,
  "Service tag/Serial number": 28,
  "IP Address": 16,
  "Mac Address": 20,
  CPU: 24,
  RAM: 14,
  HDD: 14,
  SSD: 14,
  VGA: 20,
  Other: 24,
  Status: 14,
  Notes: 34,
  ID: 14,
  "Full Name": 20,
  "Email Address": 28,
  "Phone No.": 16,
  Position: 18,
  Dept: 14,
  "Version OS": 20,
  "OS License": 18,
  "OS Key": 30,
  "OS Note": 22,
  "Version Office": 22,
  "MS License": 18,
  "Office Key": 30,
  "Office Note": 22,
};

const EXCEL_COL_WIDTHS = EXCEL_HEADERS.map((header) => {
  const explicitWidth = EXCEL_WIDTH_BY_HEADER[header];
  if (explicitWidth) {
    return { wch: explicitWidth };
  }

  // Software columns not listed above: keep enough width for version/license/key/note labels.
  const fallbackWidth = Math.max(16, Math.min(24, header.length + 4));
  return { wch: fallbackWidth };
});

const TEMPLATE_HEADER_GROUPS = [
  {
    title: "Computer Information",
    startCol: 1,
    endCol: 18,
    color: "FFCFE2F6",
  },
  {
    title: "User Information",
    startCol: 19,
    endCol: 24,
    color: "FFC6DCF2",
  },
  {
    title: "OS",
    startCol: 25,
    endCol: 28,
    color: "FFBED7EE",
  },
  {
    title: "MS Office",
    startCol: 29,
    endCol: 32,
    color: "FFB4D1EB",
  },
  {
    title: "Software",
    startCol: 33,
    endCol: EXCEL_HEADERS.length,
    color: "FFABCBE8",
  },
];

const buildTemplateSampleRow = () => {
  const sampleRowByHeader = {
    "No.": 1,
    "Asset Code": "ELT-LAP-001",
    ID: "E001",
    "Full Name": "Nguyen Van A",
    "Email Address": "nguyenvana@elentec.com",
    "Phone No.": "0901234567",
    Position: "Staff",
    Dept: "IT",
    "IP Address": "192.168.1.10",
    "Mac Address": "00:1A:2B:3C:4D:5E",
    "Computer Name": "ELT-IT-LAP-001",
    "User Name Pc": "nguyenvana",
    "Desktop / Laptop": "Laptop",
    Manufacturer: "Dell",
    Model: "Latitude 5430",
    "Service tag/Serial number": "ABC1234",
    CPU: "Intel Core i5",
    RAM: "16GB",
    HDD: "",
    SSD: "512GB",
    VGA: "Intel Iris Xe",
    Other: "",
    Status: "Active",
    Notes: "Dong du lieu mau, co the xoa truoc khi import",
    "Version OS": "Windows 11 Pro",
    "OS License": "OEM",
    "OS Key": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
    "OS Note": "",
    "Version Office": "Office 365",
    "MS License": "Subscription",
    "Office Key": "",
    "Office Note": "",
    AutoCAD_Version: "",
    AutoCAD_License: "",
    AutoCAD_Key: "",
    AutoCAD_Note: "",
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
    Symantec_Version: "14",
    Symantec_License: "Business",
    Symantec_Key: "",
    Symantec_Note: "",
  };

  return EXCEL_HEADERS.map((header) => sampleRowByHeader[header] ?? "");
};

const hasTemplateGroupHeader = (worksheet) => {
  const firstRow = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
    range: 0,
    blankrows: false,
  })[0];

  if (!firstRow || !Array.isArray(firstRow) || !firstRow.length) {
    return false;
  }

  const normalizedCells = firstRow.map((cell) => normalizeHeaderKey(cell));
  return TEMPLATE_HEADER_GROUPS.every((group) =>
    normalizedCells.some((value) =>
      value.includes(normalizeHeaderKey(group.title)),
    ),
  );
};

// Get all computers
export const getAllComputers = async (req, res) => {
  try {
    const { department, status } = req.query;
    const filter = buildComputerFilters({ department, status });

    const computers = await ComputerInfo.find(filter)
      .populate("lastUpdatedBy", "displayName idCompanny")
      .sort({ createdAt: -1 });

    // Mask product keys for list view (security)
    const maskedComputers = computers.map((comp) =>
      decryptComputerKeys(comp.toObject(), true),
    );

    res.status(200).json(maskedComputers);
  } catch (error) {
    console.error("Error getting computers:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách máy tính" });
  }
};

// Get computer by ID
export const getComputerById = async (req, res) => {
  try {
    const { id } = req.params;

    const computer = await ComputerInfo.findById(id).populate(
      "lastUpdatedBy",
      "displayName idCompanny",
    );

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    // Decrypt keys for detail view (show full keys)
    const decryptedComputer = decryptComputerKeys(computer.toObject(), false);

    res.status(200).json(decryptedComputer);
  } catch (error) {
    console.error("Error getting computer:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin máy tính" });
  }
};

// Create new computer
export const createComputer = async (req, res) => {
  try {
    const computerData = req.body;

    // Validate required fields
    if (
      !computerData.employeeNo ||
      !computerData.email ||
      !computerData.userName ||
      !computerData.department ||
      !computerData.computerName
    ) {
      return res.status(400).json({
        message:
          "Thiếu trường bắt buộc (employeeNo, email, userName, department, computerName)",
      });
    }

    // Encrypt product keys before saving
    const encryptedData = encryptComputerKeys(computerData);

    const computer = new ComputerInfo({
      ...encryptedData,
      status: computerData.status || "Active",
      lastUpdatedBy: req.userId,
    });

    await computer.save();

    res.status(201).json({
      message: "Tạo thông tin máy tính thành công",
      data: computer,
    });
  } catch (error) {
    console.error("Error creating computer:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Service Tag đã tồn tại trong hệ thống" });
    }
    res.status(500).json({ message: "Lỗi khi tạo thông tin máy tính" });
  }
};

// Update computer
export const updateComputer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Admin is always allowed; others are checked by position permissions.
    const canEdit =
      req.userRole === "admin" ||
      hasPermission(req.userPosition, "canEditAllComputers");

    // Check permission: must be able to edit computers
    if (!canEdit) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa máy tính",
      });
    }

    // Encrypt product keys before updating
    const encryptedData = encryptComputerKeys(updateData);

    // Add lastUpdatedBy
    encryptedData.lastUpdatedBy = req.userId;

    const computer = await ComputerInfo.findByIdAndUpdate(id, encryptedData, {
      returnDocument: "after",
      runValidators: true,
    }).populate("lastUpdatedBy", "displayName idCompanny");

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    res.status(200).json({
      message: "Cập nhật thông tin máy tính thành công",
      data: computer,
    });
  } catch (error) {
    console.error("Error updating computer:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Service Tag đã tồn tại trong hệ thống" });
    }
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin máy tính" });
  }
};

// Delete computer
export const deleteComputer = async (req, res) => {
  try {
    const { id } = req.params;

    // Admin is always allowed; others are checked by position permissions.
    const canDelete =
      req.userRole === "admin" ||
      hasPermission(req.userPosition, "canDeleteData");

    // Check permission: only managers can delete
    if (!canDelete) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa máy tính",
      });
    }

    const computer = await ComputerInfo.findByIdAndDelete(id);

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    res.status(200).json({
      message: "Xóa thông tin máy tính thành công",
      data: computer,
    });
  } catch (error) {
    console.error("Error deleting computer:", error);
    res.status(500).json({ message: "Lỗi khi xóa thông tin máy tính" });
  }
};

// Get computers statistics by department
export const getComputersStatsByDept = async (req, res) => {
  try {
    const stats = await ComputerInfo.aggregate([
      {
        $group: {
          _id: "$department",
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
          },
          maintenance: {
            $sum: {
              $cond: [{ $eq: ["$status", "Under Maintenance"] }, 1, 0],
            },
          },
          retired: {
            $sum: { $cond: [{ $eq: ["$status", "Retired"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting statistics:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê máy tính" });
  }
};

// Search computers
export const searchComputers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const computers = await ComputerInfo.find({
      $or: [
        { employeeNo: { $regex: q, $options: "i" } },
        { computerName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { ipAddress: { $regex: q, $options: "i" } },
        { macAddress: { $regex: q, $options: "i" } },
      ],
    });

    // Mask product keys for search results (security)
    const maskedComputers = computers.map((comp) =>
      decryptComputerKeys(comp.toObject(), true),
    );

    res.status(200).json(maskedComputers);
  } catch (error) {
    console.error("Error searching computers:", error);
    res.status(500).json({ message: "Lỗi khi tìm kiếm máy tính" });
  }
};

// Export computers to Excel
export const exportComputersToExcel = async (req, res) => {
  try {
    // Admin is always allowed; others are checked by position permissions.
    const canExport =
      req.userRole === "admin" ||
      hasPermission(req.userPosition, "canExportData");

    // Check permission: Supervisor and above can export
    if (!canExport) {
      return res.status(403).json({
        message: "Bạn không có quyền xuất dữ liệu ra Excel",
      });
    }

    const { department, status } = req.query;
    const filter = buildComputerFilters({ department, status });

    const computers = await ComputerInfo.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Decrypt keys for export (admin gets full data backup)
    const decryptedComputers = computers.map((comp) =>
      decryptComputerKeys(comp, false),
    );

    const rows = decryptedComputers.map((item, index) => {
      const row = {
        // Part 1: Information
        "No.": index + 1,
        "Asset Code": item.assetCode || "",
        ID: item.employeeNo || "",
        "Full Name": item.userName || "",
        "Email Address": item.email || "",
        "Phone No.": item.phone || "",
        Position: item.position || "",
        Dept: item.department || "",
        "IP Address": item.ipAddress || "",
        "Mac Address": item.macAddress || "",
        "Computer Name": item.computerName || "",
        "User Name Pc": item.userNamePc || "",
        "Desktop / Laptop": item.categories || "",
        Manufacturer: item.manufacturer || "",
        Model: item.systemModel || "",
        "Service tag/Serial number": item.serviceTag || "",
        CPU: item.cpu || "",
        RAM: item.ram || "",
        HDD: item.hdd || "",
        SSD: item.ssd || "",
        VGA: item.vga || "",
        Other: item.other || "",
        Status: item.status || "",
        Notes: item.notes || "",
        // Part 2: OS
        "Version OS": item.osVersion || "",
        "OS License": item.osLicense || "",
        "OS Key": item.osKey || "",
        "OS Note": item.osNote || "",
        // Part 3: MS Office
        "Version Office": item.officeVersion || "",
        "MS License": item.officeLicense || "",
        "Office Key": item.officeKey || "",
        "Office Note": item.officeNote || "",
      };

      // Part 4: Software - Add columns for each software
      SOFTWARE_LIST.forEach((softwareName) => {
        const software = item.installedSoftware?.find(
          (sw) => sw.name === softwareName,
        );
        row[`${softwareName}_Version`] = software?.version || "";
        row[`${softwareName}_License`] = software?.license || "";
        row[`${softwareName}_Key`] = software?.key || "";
        row[`${softwareName}_Note`] = software?.note || "";
      });

      return row;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Computers");

    // Keep export layout consistent with template layout.
    worksheet.columns = EXCEL_COL_WIDTHS.map((w) => ({ width: w.wch }));

    TEMPLATE_HEADER_GROUPS.forEach((group) => {
      const startCell = worksheet.getCell(1, group.startCol);
      const endCell = worksheet.getCell(1, group.endCol);

      for (let col = group.startCol; col <= group.endCol; col += 1) {
        const cell = worksheet.getCell(1, col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: group.color },
        };
        cell.font = { bold: true, color: { argb: "FF1F3A5F" }, size: 12 };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFAEC4DA" } },
          bottom: { style: "thin", color: { argb: "FFAEC4DA" } },
          left: { style: "thin", color: { argb: "FFAEC4DA" } },
          right: { style: "thin", color: { argb: "FFAEC4DA" } },
        };
      }

      worksheet.mergeCells(startCell.address + ":" + endCell.address);
      startCell.value = group.title;
    });

    const groupHeaderRow = worksheet.getRow(1);
    groupHeaderRow.height = 26;

    worksheet.addTable({
      name: "ComputersExport",
      ref: "A2",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: EXCEL_HEADERS.map((header) => ({ name: header })),
      rows: rows.map((rowData) =>
        EXCEL_HEADERS.map((header) => rowData[header] ?? ""),
      ),
    });

    // Format header row (row 2 because row 1 is grouped sections)
    const headerRow = worksheet.getRow(2);
    headerRow.height = 30;
    headerRow.font = { bold: true, color: { argb: "FF1F3A5F" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB8D2EA" },
    };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    EXCEL_HEADERS.forEach((_, colIndex) => {
      const headerCell = headerRow.getCell(colIndex + 1);
      headerCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      headerCell.border = {
        top: { style: "thin", color: { argb: "FF9FB6D0" } },
        bottom: { style: "thin", color: { argb: "FF9FB6D0" } },
        left: { style: "thin", color: { argb: "FF9FB6D0" } },
        right: { style: "thin", color: { argb: "FF9FB6D0" } },
      };
    });

    // Freeze grouped header + column header
    worksheet.views = [{ state: "frozen", ySplit: 2 }];

    const fileBuffer = await workbook.xlsx.writeBuffer();

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=computers-${timestamp}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Error exporting computers excel:", error);
    return res.status(500).json({ message: "Lỗi khi export Excel" });
  }
};

// Download empty excel template for import
export const downloadComputersTemplateExcel = async (_req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Computers Template");

    // Apply column widths first so grouped sections render with intended layout.
    worksheet.columns = EXCEL_COL_WIDTHS.map((w) => ({ width: w.wch }));

    TEMPLATE_HEADER_GROUPS.forEach((group) => {
      const startCell = worksheet.getCell(1, group.startCol);
      const endCell = worksheet.getCell(1, group.endCol);

      for (let col = group.startCol; col <= group.endCol; col += 1) {
        const cell = worksheet.getCell(1, col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: group.color },
        };
        cell.font = { bold: true, color: { argb: "FF1F3A5F" }, size: 12 };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFAEC4DA" } },
          bottom: { style: "thin", color: { argb: "FFAEC4DA" } },
          left: { style: "thin", color: { argb: "FFAEC4DA" } },
          right: { style: "thin", color: { argb: "FFAEC4DA" } },
        };
      }

      worksheet.mergeCells(startCell.address + ":" + endCell.address);
      startCell.value = group.title;
    });

    const groupHeaderRow = worksheet.getRow(1);
    groupHeaderRow.height = 26;

    const sampleRow = buildTemplateSampleRow();

    worksheet.addTable({
      name: "ComputersTemplate",
      ref: "A2",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: EXCEL_HEADERS.map((header) => ({ name: header })),
      rows: [sampleRow],
    });

    // Format header row (row 2 because row 1 is grouped sections)
    const headerRow = worksheet.getRow(2);
    headerRow.height = 30; // Padding trên dưới
    headerRow.font = { bold: true, color: { argb: "FF1F3A5F" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB8D2EA" },
    };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    // Add border to all header cells
    EXCEL_HEADERS.forEach((_, colIndex) => {
      const headerCell = headerRow.getCell(colIndex + 1);
      headerCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      headerCell.border = {
        top: { style: "thin", color: { argb: "FF9FB6D0" } },
        bottom: { style: "thin", color: { argb: "FF9FB6D0" } },
        left: { style: "thin", color: { argb: "FF9FB6D0" } },
        right: { style: "thin", color: { argb: "FF9FB6D0" } },
      };
    });

    // Style sample row to clearly show editable data.
    const sampleDataRow = worksheet.getRow(3);
    sampleDataRow.height = 22;
    sampleDataRow.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    EXCEL_HEADERS.forEach((_, colIndex) => {
      const sampleCell = sampleDataRow.getCell(colIndex + 1);
      sampleCell.border = {
        top: { style: "thin", color: { argb: "FFD9E1F2" } },
        bottom: { style: "thin", color: { argb: "FFD9E1F2" } },
        left: { style: "thin", color: { argb: "FFD9E1F2" } },
        right: { style: "thin", color: { argb: "FFD9E1F2" } },
      };
    });

    // Freeze grouped header + column header
    worksheet.views = [{ state: "frozen", ySplit: 2 }];

    const fileBuffer = await workbook.xlsx.writeBuffer();

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=computers-template-${timestamp}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Error downloading template excel:", error);
    return res.status(500).json({ message: "Lỗi khi tải file mẫu Excel" });
  }
};

// Import computers from Excel
export const importComputersFromExcel = async (req, res) => {
  try {
    // Admin is always allowed; others are checked by position permissions.
    const canImport =
      req.userRole === "admin" ||
      hasPermission(req.userPosition, "canImportData");

    // Check permission: only Assistant Manager and above can import
    if (!canImport) {
      return res.status(403).json({
        message: "Bạn không có quyền nhập dữ liệu từ Excel",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file Excel để import" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return res.status(400).json({ message: "File Excel không có dữ liệu" });
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const hasGroupedHeader = hasTemplateGroupHeader(worksheet);
    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
      range: hasGroupedHeader ? 1 : 0,
    });

    const rows = rawRows.filter((row) =>
      Object.values(row).some((value) => normalizeCellValue(value) !== ""),
    );

    if (!rows.length) {
      return res
        .status(400)
        .json({ message: "File Excel rỗng hoặc chỉ có tiêu đề" });
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const firstDataRowNumber = hasGroupedHeader ? 3 : 2;

    for (let index = 0; index < rows.length; index += 1) {
      try {
        const row = rows[index];
        const payload = mapExcelRowToComputerPayload(row);

        if (
          !payload.employeeNo ||
          !payload.email ||
          !payload.userName ||
          !payload.department ||
          !payload.computerName
        ) {
          skippedCount += 1;
          errors.push(
            `Dòng ${index + firstDataRowNumber}: thiếu trường bắt buộc`,
          );
          continue;
        }

        // Encrypt product keys before saving/updating
        const encryptedPayload = encryptComputerKeys(payload);

        const findConditions = [];
        if (encryptedPayload.serviceTag) {
          findConditions.push({ serviceTag: encryptedPayload.serviceTag });
        }
        findConditions.push({
          employeeNo: encryptedPayload.employeeNo,
          computerName: encryptedPayload.computerName,
        });

        const existing = await ComputerInfo.findOne({ $or: findConditions });

        if (existing) {
          await ComputerInfo.findByIdAndUpdate(existing._id, {
            ...encryptedPayload,
            lastUpdatedBy: req.userId,
          });
          updatedCount += 1;
        } else {
          await ComputerInfo.create({
            ...encryptedPayload,
            lastUpdatedBy: req.userId,
          });
          createdCount += 1;
        }
      } catch (error) {
        skippedCount += 1;
        errors.push(`Dòng ${index + 2}: ${error.message}`);
      }
    }

    return res.status(200).json({
      message: "Import Excel hoàn tất",
      result: {
        totalRows: rows.length,
        createdCount,
        updatedCount,
        skippedCount,
        errors: errors.slice(0, 20),
      },
    });
  } catch (error) {
    console.error("Error importing computers excel:", error);
    return res.status(500).json({ message: "Lỗi khi import Excel" });
  }
};
