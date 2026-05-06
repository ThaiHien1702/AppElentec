import mongoose from "mongoose";
import Overtime from "../models/Overtime.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";
import XLSX from "xlsx";

// Validate HH:mm format
const isValidTime = (time) => {
  if (!time) return false;
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
};

// Tạo yêu cầu OT mới
export const createOvertimeRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { checkInDate, otPlanStart, otPlanFinish, reason, notes } = req.body;

    // Validate
    if (!checkInDate) {
      return res
        .status(400)
        .json({ message: "Ngày làm OT không được để trống" });
    }
    if (!otPlanStart || !isValidTime(otPlanStart)) {
      return res
        .status(400)
        .json({ message: "Giờ bắt đầu OT không hợp lệ (HH:mm)" });
    }
    if (!otPlanFinish || !isValidTime(otPlanFinish)) {
      return res
        .status(400)
        .json({ message: "Giờ kết thúc OT không hợp lệ (HH:mm)" });
    }
    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ message: "Lý do làm thêm không được để trống" });
    }

    const otRequest = new Overtime({
      user: userId,
      checkInDate: new Date(checkInDate),
      otPlanStart,
      otPlanFinish,
      reason: reason.trim(),
      notes: notes ? notes.trim() : null,
    });

    await otRequest.save();
    await otRequest.populate(
      "user",
      "displayName idCompanny department position",
    );

    return res.status(201).json({
      message: "Đăng ký giờ làm thêm thành công",
      overtime: otRequest,
    });
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách OT của user hiện tại
export const getMyOvertimeRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const overtimeRequests = await Overtime.find(query)
      .populate("approvedBy", "displayName")
      .sort({ checkInDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Overtime.countDocuments(query);

    return res.status(200).json({
      overtimeRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy tất cả OT (admin/moderator)
export const getAllOvertimeRequests = async (req, res) => {
  try {
    const { status, user, page = 1, limit = 20, from, to } = req.query;

    const query = {};
    if (status) query.status = status;
    if (user) query.user = user;
    if (from || to) {
      query.checkInDate = {};
      if (from) query.checkInDate.$gte = new Date(from);
      if (to) query.checkInDate.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const overtimeRequests = await Overtime.find(query)
      .populate("user", "displayName idCompanny department position")
      .populate("approvedBy", "displayName")
      .sort({ checkInDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Overtime.countDocuments(query);

    return res.status(200).json({
      overtimeRequests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy chi tiết OT theo ID
export const getOvertimeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const overtime = await Overtime.findById(id)
      .populate("user", "displayName idCompanny department position")
      .populate("approvedBy", "displayName");

    if (!overtime) {
      return res.status(404).json({ message: "Yêu cầu OT không tồn tại" });
    }

    // Only owner or admin/moderator can view
    if (
      overtime.user._id.toString() !== userId &&
      userRole !== "admin" &&
      userRole !== "moderator"
    ) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    return res.status(200).json(overtime);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Phê duyệt OT
export const approveOvertimeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const approverId = req.userId;

    const overtime = await Overtime.findById(id);
    if (!overtime) {
      return res.status(404).json({ message: "Yêu cầu OT không tồn tại" });
    }

    if (overtime.status !== "PENDING") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý" });
    }

    overtime.status = "APPROVED";
    overtime.approvedBy = approverId;
    overtime.approvedAt = new Date();
    if (notes) overtime.notes = notes;

    await overtime.save();
    await overtime.populate(
      "user",
      "displayName idCompanny department position",
    );
    await overtime.populate("approvedBy", "displayName");

    return res.status(200).json({
      message: "Yêu cầu OT đã được phê duyệt",
      overtime,
    });
  } catch (error) {
    console.error("Lỗi khi phê duyệt OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Từ chối OT
export const rejectOvertimeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, notes } = req.body;
    const approverId = req.userId;

    const overtime = await Overtime.findById(id);
    if (!overtime) {
      return res.status(404).json({ message: "Yêu cầu OT không tồn tại" });
    }

    if (overtime.status !== "PENDING") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý" });
    }

    overtime.status = "REJECTED";
    overtime.approvedBy = approverId;
    overtime.approvedAt = new Date();
    overtime.rejectionReason = rejectionReason;
    if (notes) overtime.notes = notes;

    await overtime.save();
    await overtime.populate(
      "user",
      "displayName idCompanny department position",
    );
    await overtime.populate("approvedBy", "displayName");

    return res.status(200).json({
      message: "Yêu cầu OT đã bị từ chối",
      overtime,
    });
  } catch (error) {
    console.error("Lỗi khi từ chối OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Hủy OT (chỉ user tạo)
export const cancelOvertimeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const overtime = await Overtime.findById(id);
    if (!overtime) {
      return res.status(404).json({ message: "Yêu cầu OT không tồn tại" });
    }

    if (overtime.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Không có quyền hủy yêu cầu này" });
    }

    if (overtime.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Không thể hủy yêu cầu đã được xử lý" });
    }

    overtime.status = "CANCELLED";
    await overtime.save();

    return res.status(200).json({
      message: "Yêu cầu OT đã được hủy",
      overtime,
    });
  } catch (error) {
    console.error("Lỗi khi hủy OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật OT (chỉ khi còn PENDING)
export const updateOvertimeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, otPlanStart, otPlanFinish, reason, notes } = req.body;
    const userId = req.userId;

    const overtime = await Overtime.findById(id);
    if (!overtime) {
      return res.status(404).json({ message: "Yêu cầu OT không tồn tại" });
    }

    if (overtime.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Không có quyền cập nhật yêu cầu này" });
    }

    if (overtime.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Không thể cập nhật yêu cầu đã được xử lý" });
    }

    if (otPlanStart && !isValidTime(otPlanStart)) {
      return res
        .status(400)
        .json({ message: "Giờ bắt đầu OT không hợp lệ (HH:mm)" });
    }
    if (otPlanFinish && !isValidTime(otPlanFinish)) {
      return res
        .status(400)
        .json({ message: "Giờ kết thúc OT không hợp lệ (HH:mm)" });
    }

    if (checkInDate) overtime.checkInDate = new Date(checkInDate);
    if (otPlanStart) overtime.otPlanStart = otPlanStart;
    if (otPlanFinish) overtime.otPlanFinish = otPlanFinish;
    if (reason) overtime.reason = reason.trim();
    overtime.notes =
      notes !== undefined ? (notes ? notes.trim() : null) : overtime.notes;

    await overtime.save();
    await overtime.populate(
      "user",
      "displayName idCompanny department position",
    );

    return res.status(200).json({
      message: "Yêu cầu OT đã được cập nhật",
      overtime,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật OT Result (admin/moderator ghi nhận kết quả thực tế)
export const updateOvertimeResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { otResultStart, otResultFinish, notes } = req.body;

    const overtime = await Overtime.findById(id);
    if (!overtime) {
      return res.status(404).json({ message: "Yêu cầu OT không tồn tại" });
    }

    if (overtime.status !== "APPROVED" && overtime.status !== "COMPLETED") {
      return res
        .status(400)
        .json({ message: "Chỉ cập nhật kết quả cho OT đã được duyệt" });
    }

    if (otResultStart && !isValidTime(otResultStart)) {
      return res
        .status(400)
        .json({ message: "Giờ bắt đầu thực tế không hợp lệ (HH:mm)" });
    }
    if (otResultFinish && !isValidTime(otResultFinish)) {
      return res
        .status(400)
        .json({ message: "Giờ kết thúc thực tế không hợp lệ (HH:mm)" });
    }

    if (otResultStart) overtime.otResultStart = otResultStart;
    if (otResultFinish) overtime.otResultFinish = otResultFinish;
    if (notes) overtime.notes = notes.trim();

    // Tự động chuyển sang COMPLETED khi có cả start và finish
    if (overtime.otResultStart && overtime.otResultFinish) {
      overtime.status = "COMPLETED";
    }

    await overtime.save();
    await overtime.populate(
      "user",
      "displayName idCompanny department position",
    );
    await overtime.populate("approvedBy", "displayName");

    return res.status(200).json({
      message: "Cập nhật kết quả OT thành công",
      overtime,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật kết quả OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Thống kê OT theo user
export const getOvertimeStats = async (req, res) => {
  try {
    const userId = req.userId;
    const currentYear = new Date().getFullYear();

    const stats = await Overtime.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          status: { $in: ["APPROVED", "COMPLETED"] },
          checkInDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$checkInDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const total = await Overtime.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      status: { $in: ["APPROVED", "COMPLETED"] },
      checkInDate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
    });

    return res.status(200).json({
      year: currentYear,
      totalOvertimeDays: total,
      byMonth: stats,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê OT:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Export danh sách yêu cầu làm thêm ra Excel
export const exportOvertimeToExcel = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const userRole = req.userRole;

    // Chỉ admin/moderator mới được export
    if (userRole !== "admin" && userRole !== "moderator") {
      return res.status(403).json({
        message: "Bạn không có quyền xuất dữ liệu ra Excel",
      });
    }

    const query = {};
    if (status) query.status = status;
    if (from || to) {
      query.checkInDate = {};
      if (from) query.checkInDate.$gte = new Date(from);
      if (to) query.checkInDate.$lte = new Date(to);
    }

    const overtimeRequests = await Overtime.find(query)
      .populate("user", "displayName email idCompanny department position")
      .populate("approvedBy", "displayName")
      .sort({ checkInDate: -1 })
      .lean();

    const STATUS_MAP = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Từ chối",
      CANCELLED: "Đã hủy",
      COMPLETED: "Hoàn thành",
    };

    const rows = overtimeRequests.map((item, index) => ({
      "No.": index + 1,
      "Mã nhân viên": item.user?.idCompanny || "",
      "Tên nhân viên": item.user?.displayName || "",
      Email: item.user?.email || "",
      "Phòng ban": item.user?.department || "",
      "Chức vụ": item.user?.position || "",
      "Ngày làm OT": item.checkInDate
        ? new Date(item.checkInDate).toLocaleDateString("vi-VN")
        : "",
      "Giờ bắt đầu (kế hoạch)": item.otPlanStart || "",
      "Giờ kết thúc (kế hoạch)": item.otPlanFinish || "",
      "Giờ bắt đầu (thực tế)": item.otResultStart || "",
      "Giờ kết thúc (thực tế)": item.otResultFinish || "",
      "Lý do": item.reason || "",
      "Trạng thái": STATUS_MAP[item.status] || item.status,
      "Ghi chú": item.notes || "",
      "Người duyệt": item.approvedBy?.displayName || "",
      "Ngày duyệt": item.approvedAt
        ? new Date(item.approvedAt).toLocaleDateString("vi-VN")
        : "",
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách làm thêm");

    const headers = [
      "No.",
      "Mã nhân viên",
      "Tên nhân viên",
      "Email",
      "Phòng ban",
      "Chức vụ",
      "Ngày làm OT",
      "Giờ bắt đầu (kế hoạch)",
      "Giờ kết thúc (kế hoạch)",
      "Giờ bắt đầu (thực tế)",
      "Giờ kết thúc (thực tế)",
      "Lý do",
      "Trạng thái",
      "Ghi chú",
      "Người duyệt",
      "Ngày duyệt",
    ];

    worksheet.columns = headers.map((header) => ({
      header,
      width: header === "No." ? 5 : 18,
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
      `attachment; filename=overtime-requests-${timestamp}.xlsx`,
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
export const downloadOvertimeTemplateExcel = async (_req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Mẫu đăng ký làm thêm");

    const headers = [
      "No.",
      "Mã nhân viên",
      "Tên nhân viên",
      "Email",
      "Phòng ban",
      "Chức vụ",
      "Ngày làm OT",
      "Giờ bắt đầu",
      "Giờ kết thúc",
      "Lý do",
      "Ghi chú",
    ];

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
    const today = new Date();
    const sampleRow = worksheet.addRow([
      1,
      "001",
      "Nguyễn Văn A",
      "nguyenvana@example.com",
      "Phòng IT",
      "Nhân viên",
      today.toLocaleDateString("vi-VN"),
      "18:00",
      "21:00",
      "Hoàn thành dự án X",
      "Ghi chú thêm",
    ]);

    sampleRow.font = { italic: true, color: { argb: "FFB3B3B3" } };

    // Add instructions
    const instructionRow = worksheet.addRow([]);
    instructionRow.height = 30;
    worksheet.mergeCells(`A${instructionRow.number}:K${instructionRow.number}`);
    const instructionCell = instructionRow.getCell(1);
    instructionCell.value =
      "Hướng dẫn: Điền thông tin đăng ký làm thêm. Giờ làm dưới định dạng HH:mm (ví dụ: 18:00)";
    instructionCell.font = { italic: true, size: 10 };
    instructionCell.alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };

    const fileBuffer = await workbook.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=overtime-template-${timestamp}.xlsx`,
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

// Import danh sách yêu cầu làm thêm từ Excel
export const importOvertimeFromExcel = async (req, res) => {
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

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      try {
        const row = rawRows[i];
        const empNo = String(row["Mã nhân viên"] || "").trim();
        const checkInDateInput = row["Ngày làm OT"];
        const otPlanStart = String(row["Giờ bắt đầu"] || "").trim();
        const otPlanFinish = String(row["Giờ kết thúc"] || "").trim();
        const reason = String(row["Lý do"] || "").trim();
        const notes = String(row["Ghi chú"] || "").trim();

        if (
          !empNo ||
          !checkInDateInput ||
          !otPlanStart ||
          !otPlanFinish ||
          !reason
        ) {
          errorCount++;
          results.push({
            row: i + 2,
            status: "error",
            message: "Thiếu thông tin bắt buộc",
          });
          continue;
        }

        // Validate time format
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(otPlanStart) || !timeRegex.test(otPlanFinish)) {
          errorCount++;
          results.push({
            row: i + 2,
            status: "error",
            message: "Format giờ không hợp lệ (sử dụng HH:mm)",
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

        // Parse date
        let checkInDate;
        try {
          checkInDate = new Date(checkInDateInput);
          if (isNaN(checkInDate.getTime())) {
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

        // Create overtime request
        const otRequest = new Overtime({
          user: user._id,
          checkInDate,
          otPlanStart,
          otPlanFinish,
          reason,
          notes: notes || "",
          status: "PENDING",
        });

        await otRequest.save();
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
