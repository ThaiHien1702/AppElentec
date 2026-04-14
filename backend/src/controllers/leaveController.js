import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import User from "../models/User.js";

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
