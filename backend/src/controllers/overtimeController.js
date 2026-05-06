import mongoose from "mongoose";
import Overtime from "../models/Overtime.js";

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
      return res.status(400).json({ message: "Ngày làm OT không được để trống" });
    }
    if (!otPlanStart || !isValidTime(otPlanStart)) {
      return res.status(400).json({ message: "Giờ bắt đầu OT không hợp lệ (HH:mm)" });
    }
    if (!otPlanFinish || !isValidTime(otPlanFinish)) {
      return res.status(400).json({ message: "Giờ kết thúc OT không hợp lệ (HH:mm)" });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Lý do làm thêm không được để trống" });
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
    await otRequest.populate("user", "displayName idCompanny department position");

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
    if (overtime.user._id.toString() !== userId && userRole !== "admin" && userRole !== "moderator") {
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
    await overtime.populate("user", "displayName idCompanny department position");
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
    await overtime.populate("user", "displayName idCompanny department position");
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
      return res.status(403).json({ message: "Không có quyền hủy yêu cầu này" });
    }

    if (overtime.status !== "PENDING") {
      return res.status(400).json({ message: "Không thể hủy yêu cầu đã được xử lý" });
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
      return res.status(403).json({ message: "Không có quyền cập nhật yêu cầu này" });
    }

    if (overtime.status !== "PENDING") {
      return res.status(400).json({ message: "Không thể cập nhật yêu cầu đã được xử lý" });
    }

    if (otPlanStart && !isValidTime(otPlanStart)) {
      return res.status(400).json({ message: "Giờ bắt đầu OT không hợp lệ (HH:mm)" });
    }
    if (otPlanFinish && !isValidTime(otPlanFinish)) {
      return res.status(400).json({ message: "Giờ kết thúc OT không hợp lệ (HH:mm)" });
    }

    if (checkInDate) overtime.checkInDate = new Date(checkInDate);
    if (otPlanStart) overtime.otPlanStart = otPlanStart;
    if (otPlanFinish) overtime.otPlanFinish = otPlanFinish;
    if (reason) overtime.reason = reason.trim();
    overtime.notes = notes !== undefined ? (notes ? notes.trim() : null) : overtime.notes;

    await overtime.save();
    await overtime.populate("user", "displayName idCompanny department position");

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
      return res.status(400).json({ message: "Chỉ cập nhật kết quả cho OT đã được duyệt" });
    }

    if (otResultStart && !isValidTime(otResultStart)) {
      return res.status(400).json({ message: "Giờ bắt đầu thực tế không hợp lệ (HH:mm)" });
    }
    if (otResultFinish && !isValidTime(otResultFinish)) {
      return res.status(400).json({ message: "Giờ kết thúc thực tế không hợp lệ (HH:mm)" });
    }

    if (otResultStart) overtime.otResultStart = otResultStart;
    if (otResultFinish) overtime.otResultFinish = otResultFinish;
    if (notes) overtime.notes = notes.trim();

    // Tự động chuyển sang COMPLETED khi có cả start và finish
    if (overtime.otResultStart && overtime.otResultFinish) {
      overtime.status = "COMPLETED";
    }

    await overtime.save();
    await overtime.populate("user", "displayName idCompanny department position");
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
