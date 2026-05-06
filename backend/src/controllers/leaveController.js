import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";
import XLSX from "xlsx";

// Tạo yêu cầu nghỉ phép mới
export const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, notes } = req.body;
    const userId = req.userId; // Từ verifyToken middleware

    // Tính số ngày nghỉ
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 vì bao gồm cả ngày đầu và cuối

    const leaveRequest = new Leave({
      user: userId,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      notes,
    });

    await leaveRequest.save();

    // Populate user info
    await leaveRequest.populate("user", "displayName department position");

    return res.status(201).json({
      message: "Yêu cầu nghỉ phép đã được tạo thành công",
      leaveRequest,
    });
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách yêu cầu nghỉ phép của user hiện tại
export const getMyLeaveRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const leaveRequests = await Leave.find(query)
      .populate("approvedBy", "displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leave.countDocuments(query);

    return res.status(200).json({
      leaveRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy tất cả yêu cầu nghỉ phép (cho admin/manager)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, user, leaveType, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (user) query.user = user;
    if (leaveType) query.leaveType = leaveType;

    const skip = (page - 1) * limit;

    const leaveRequests = await Leave.find(query)
      .populate("user", "displayName department position")
      .populate("approvedBy", "displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leave.countDocuments(query);

    return res.status(200).json({
      leaveRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy yêu cầu nghỉ phép theo ID
export const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const leaveRequest = await Leave.findById(id)
      .populate("user", "displayName department position")
      .populate("approvedBy", "displayName");

    if (!leaveRequest) {
      return res
        .status(404)
        .json({ message: "Yêu cầu nghỉ phép không tồn tại" });
    }

    // Chỉ user tạo hoặc admin mới xem được
    if (leaveRequest.user._id.toString() !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    return res.status(200).json(leaveRequest);
  } catch (error) {
    console.error("Lỗi khi lấy yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Phê duyệt yêu cầu nghỉ phép
export const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const approverId = req.userId;

    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ message: "Yêu cầu nghỉ phép không tồn tại" });
    }

    if (leaveRequest.status !== "PENDING") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý" });
    }

    leaveRequest.status = "APPROVED";
    leaveRequest.approvedBy = approverId;
    leaveRequest.approvedAt = new Date();
    if (notes) leaveRequest.notes = notes;

    await leaveRequest.save();
    await leaveRequest.populate("user", "displayName department position");
    await leaveRequest.populate("approvedBy", "displayName");

    return res.status(200).json({
      message: "Yêu cầu nghỉ phép đã được phê duyệt",
      leaveRequest,
    });
  } catch (error) {
    console.error("Lỗi khi phê duyệt yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Từ chối yêu cầu nghỉ phép
export const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, notes } = req.body;
    const approverId = req.userId;

    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ message: "Yêu cầu nghỉ phép không tồn tại" });
    }

    if (leaveRequest.status !== "PENDING") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý" });
    }

    leaveRequest.status = "REJECTED";
    leaveRequest.approvedBy = approverId;
    leaveRequest.approvedAt = new Date();
    leaveRequest.rejectionReason = rejectionReason;
    if (notes) leaveRequest.notes = notes;

    await leaveRequest.save();
    await leaveRequest.populate("user", "displayName department position");
    await leaveRequest.populate("approvedBy", "displayName");

    return res.status(200).json({
      message: "Yêu cầu nghỉ phép đã bị từ chối",
      leaveRequest,
    });
  } catch (error) {
    console.error("Lỗi khi từ chối yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Hủy yêu cầu nghỉ phép (chỉ user tạo mới được hủy)
export const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ message: "Yêu cầu nghỉ phép không tồn tại" });
    }

    if (leaveRequest.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Không có quyền hủy yêu cầu này" });
    }

    if (leaveRequest.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Không thể hủy yêu cầu đã được xử lý" });
    }

    leaveRequest.status = "CANCELLED";
    await leaveRequest.save();

    return res.status(200).json({
      message: "Yêu cầu nghỉ phép đã được hủy",
      leaveRequest,
    });
  } catch (error) {
    console.error("Lỗi khi hủy yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật yêu cầu nghỉ phép (chỉ khi còn PENDING)
export const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaveType, startDate, endDate, reason, notes } = req.body;
    const userId = req.userId;

    const leaveRequest = await Leave.findById(id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ message: "Yêu cầu nghỉ phép không tồn tại" });
    }

    if (leaveRequest.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Không có quyền cập nhật yêu cầu này" });
    }

    if (leaveRequest.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Không thể cập nhật yêu cầu đã được xử lý" });
    }

    // Tính lại số ngày nếu thay đổi ngày
    let daysCount = leaveRequest.daysCount;
    if (startDate || endDate) {
      const start = new Date(startDate || leaveRequest.startDate);
      const end = new Date(endDate || leaveRequest.endDate);
      const diffTime = Math.abs(end - start);
      daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    leaveRequest.leaveType = leaveType || leaveRequest.leaveType;
    leaveRequest.startDate = startDate
      ? new Date(startDate)
      : leaveRequest.startDate;
    leaveRequest.endDate = endDate ? new Date(endDate) : leaveRequest.endDate;
    leaveRequest.daysCount = daysCount;
    leaveRequest.reason = reason || leaveRequest.reason;
    leaveRequest.notes = notes || leaveRequest.notes;

    await leaveRequest.save();
    await leaveRequest.populate("user", "displayName department position");

    return res.status(200).json({
      message: "Yêu cầu nghỉ phép đã được cập nhật",
      leaveRequest,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật yêu cầu nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Thống kê nghỉ phép theo user
export const getLeaveStats = async (req, res) => {
  try {
    const userId = req.userId;
    const currentYear = new Date().getFullYear();

    const stats = await Leave.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: "APPROVED",
          startDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: "$leaveType",
          totalDays: { $sum: "$daysCount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      year: currentYear,
      stats,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Export danh sách yêu cầu nghỉ phép ra Excel
export const exportLeaveToExcel = async (req, res) => {
  try {
    const { status } = req.query;
    const userRole = req.userRole;

    // Chỉ admin/moderator mới được export
    if (userRole !== "admin" && userRole !== "moderator") {
      return res.status(403).json({
        message: "Bạn không có quyền xuất dữ liệu ra Excel",
      });
    }

    const query = {};
    if (status) query.status = status;

    const leaveRequests = await Leave.find(query)
      .populate("user", "displayName email idCompanny department position")
      .populate("approvedBy", "displayName")
      .sort({ createdAt: -1 })
      .lean();

    const LEAVE_TYPES = {
      ANNUAL: "Nghỉ năm",
      SICK: "Nghỉ ốm",
      PERSONAL: "Nghỉ cá nhân",
      MATERNITY: "Nghỉ thai sản",
      OTHER: "Khác",
    };

    const rows = leaveRequests.map((item, index) => ({
      "No.": index + 1,
      "Mã nhân viên": item.user?.idCompanny || "",
      "Tên nhân viên": item.user?.displayName || "",
      Email: item.user?.email || "",
      "Phòng ban": item.user?.department || "",
      "Chức vụ": item.user?.position || "",
      "Loại nghỉ": LEAVE_TYPES[item.leaveType] || item.leaveType,
      "Ngày bắt đầu": item.startDate
        ? new Date(item.startDate).toLocaleDateString("vi-VN")
        : "",
      "Ngày kết thúc": item.endDate
        ? new Date(item.endDate).toLocaleDateString("vi-VN")
        : "",
      "Số ngày": item.daysCount || 0,
      "Lý do": item.reason || "",
      "Trạng thái": item.status || "",
      "Ghi chú": item.notes || "",
      "Người duyệt": item.approvedBy?.displayName || "",
      "Ngày duyệt": item.approvedAt
        ? new Date(item.approvedAt).toLocaleDateString("vi-VN")
        : "",
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách nghỉ phép");

    const headers = [
      "No.",
      "Mã nhân viên",
      "Tên nhân viên",
      "Email",
      "Phòng ban",
      "Chức vụ",
      "Loại nghỉ",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Số ngày",
      "Lý do",
      "Trạng thái",
      "Ghi chú",
      "Người duyệt",
      "Ngày duyệt",
    ];

    // Set column widths
    worksheet.columns = headers.map((header) => ({
      header,
      width: header === "No." ? 5 : 15,
    }));

    // Format header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FF1F3A5F" }, size: 11 };
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

    // Add data rows
    rows.forEach((row) => {
      worksheet.addRow(row);
    });

    // Format data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { horizontal: "left", vertical: "middle" };
        row.border = {
          top: { style: "thin", color: { argb: "FFD9E1F2" } },
          bottom: { style: "thin", color: { argb: "FFD9E1F2" } },
          left: { style: "thin", color: { argb: "FFD9E1F2" } },
          right: { style: "thin", color: { argb: "FFD9E1F2" } },
        };
      }
    });

    const fileBuffer = await workbook.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leave-requests-${timestamp}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Lỗi khi export Excel:", error);
    return res.status(500).json({ message: "Lỗi khi export Excel" });
  }
};

// Download mẫu Excel cho import
export const downloadLeaveTemplateExcel = async (_req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Mẫu yêu cầu nghỉ phép");

    const LEAVE_TYPES = [
      "Nghỉ năm",
      "Nghỉ ốm",
      "Nghỉ cá nhân",
      "Nghỉ thai sản",
      "Khác",
    ];

    const headers = [
      "No.",
      "Mã nhân viên",
      "Tên nhân viên",
      "Email",
      "Phòng ban",
      "Chức vụ",
      "Loại nghỉ",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Số ngày",
      "Lý do",
      "Ghi chú",
    ];

    // Set column widths
    worksheet.columns = headers.map((header) => ({
      header,
      width: header === "No." ? 5 : 18,
    }));

    // Format header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    // Add sample row
    const sampleRow = worksheet.addRow([
      1,
      "001",
      "Nguyễn Văn A",
      "nguyenvana@example.com",
      "Phòng IT",
      "Nhân viên",
      "Nghỉ năm",
      new Date().toLocaleDateString("vi-VN"),
      new Date(Date.now() + 86400000).toLocaleDateString("vi-VN"),
      1,
      "Lý do cần nghỉ phép",
      "Ghi chú thêm",
    ]);

    sampleRow.font = { italic: true, color: { argb: "FFB3B3B3" } };

    // Add instructions
    const instructionRow = worksheet.addRow([]);
    instructionRow.height = 30;
    worksheet.mergeCells(`A${instructionRow.number}:L${instructionRow.number}`);
    const instructionCell = instructionRow.getCell(1);
    instructionCell.value =
      "Hướng dẫn: Điền thông tin yêu cầu nghỉ phép. Loại nghỉ: Nghỉ năm, Nghỉ ốm, Nghỉ cá nhân, Nghỉ thai sản, Khác";
    instructionCell.font = { italic: true, size: 10 };
    instructionCell.alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };

    // Add data validation for leave type column
    worksheet.dataValidations.add({
      type: "list",
      formula1: `"${LEAVE_TYPES.join(",")}"`,
      showDropDown: true,
      sqref: "G2:G100",
    });

    const fileBuffer = await workbook.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leave-template-${timestamp}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Lỗi khi download mẫu Excel:", error);
    return res.status(500).json({ message: "Lỗi khi download mẫu Excel" });
  }
};

// Import danh sách yêu cầu nghỉ phép từ Excel
export const importLeaveFromExcel = async (req, res) => {
  try {
    const userRole = req.userRole;

    // Chỉ admin/moderator mới được import
    if (userRole !== "admin" && userRole !== "moderator") {
      return res.status(403).json({
        message: "Bạn không có quyền import dữ liệu",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file Excel" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    const LEAVE_TYPE_MAP = {
      "nghỉ năm": "ANNUAL",
      annual: "ANNUAL",
      "nghỉ ốm": "SICK",
      sick: "SICK",
      "nghỉ cá nhân": "PERSONAL",
      personal: "PERSONAL",
      "nghỉ thai sản": "MATERNITY",
      maternity: "MATERNITY",
      khác: "OTHER",
      other: "OTHER",
    };

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      try {
        const row = rawRows[i];
        const empNo = String(row["Mã nhân viên"] || "").trim();
        const leaveTypeInput = String(row["Loại nghỉ"] || "")
          .trim()
          .toLowerCase();
        const startDateInput = row["Ngày bắt đầu"];
        const endDateInput = row["Ngày kết thúc"];
        const reason = String(row["Lý do"] || "").trim();
        const notes = String(row["Ghi chú"] || "").trim();

        if (!empNo || !leaveTypeInput || !startDateInput || !endDateInput) {
          errorCount++;
          results.push({
            row: i + 2,
            status: "error",
            message: "Thiếu thông tin bắt buộc",
          });
          continue;
        }

        const leaveType =
          LEAVE_TYPE_MAP[leaveTypeInput] ||
          LEAVE_TYPE_MAP[leaveTypeInput.replace(/\s+/g, "_")];
        if (!leaveType) {
          errorCount++;
          results.push({
            row: i + 2,
            status: "error",
            message: "Loại nghỉ không hợp lệ",
          });
          continue;
        }

        // Find user by employee ID
        const user = await User.findOne({ idCompanny: empNo });
        if (!user) {
          errorCount++;
          results.push({
            row: i + 2,
            status: "error",
            message: `Không tìm thấy nhân viên với mã: ${empNo}`,
          });
          continue;
        }

        // Parse dates (support multiple formats)
        let startDate, endDate;
        try {
          startDate = new Date(startDateInput);
          endDate = new Date(endDateInput);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error("Invalid date");
          }
        } catch {
          errorCount++;
          results.push({
            row: i + 2,
            status: "error",
            message: "Định dạng ngày không hợp lệ",
          });
          continue;
        }

        // Calculate days
        const diffTime = Math.abs(endDate - startDate);
        const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Create leave request
        const leaveRequest = new Leave({
          user: user._id,
          leaveType,
          startDate,
          endDate,
          daysCount,
          reason: reason || "",
          notes: notes || "",
          status: "PENDING",
        });

        await leaveRequest.save();
        successCount++;
        results.push({
          row: i + 2,
          status: "success",
          message: "Import thành công",
        });
      } catch (error) {
        errorCount++;
        results.push({
          row: i + 2,
          status: "error",
          message: `Lỗi: ${error.message}`,
        });
      }
    }

    return res.status(200).json({
      message: `Import thành công ${successCount} bản ghi, ${errorCount} lỗi`,
      successCount,
      errorCount,
      results,
    });
  } catch (error) {
    console.error("Lỗi khi import Excel:", error);
    return res.status(500).json({ message: "Lỗi khi import Excel" });
  }
};
