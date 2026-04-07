import mongoose from "mongoose";
import Luggage from "../models/Luggage.js";
import VisitRequest from "../models/VisitRequest.js";
import AuditLog from "../models/AuditLog.js";

// Sinh mã tracking cho hành lý
const generateTrackingCode = () => {
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `LUG-${yyyymmdd}-${rand}`;
};

// Ghi audit log
const logAudit = async (req, action, entityType, entityId, metadata = {}) => {
  try {
    await AuditLog.create({
      actorId: req.userId,
      actorRole: req.userRole,
      action,
      entityType,
      entityId: String(entityId),
      metadata,
    });
  } catch (error) {
    console.error("[Audit Log] Error:", error);
  }
};

// Kiểm tra quyền truy cập
const isGateRole = (role) => ["admin", "moderator"].includes(role);

/**
 * Thêm hành lý cho yêu cầu ra/vào
 */
export const addLuggage = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền thêm hành lý" });
    }

    const {
      visitRequestId,
      itemName,
      description,
      quantity,
      itemType,
      estimatedValue,
      itemImageData,
    } = req.body;

    // Kiểm tra input
    if (!visitRequestId || !mongoose.Types.ObjectId.isValid(visitRequestId)) {
      return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
    }

    if (!itemName || !itemName.trim()) {
      return res
        .status(400)
        .json({ message: "Tên hành lý không được để trống" });
    }

    if (quantity && (quantity < 1 || !Number.isInteger(quantity))) {
      return res
        .status(400)
        .json({ message: "Số lượng phải là số nguyên dương" });
    }

    if (
      itemType &&
      !["PERSONAL_ITEM", "LUGGAGE", "VEHICLE", "EQUIPMENT", "OTHER"].includes(
        itemType,
      )
    ) {
      return res.status(400).json({ message: "Loại hành lý không hợp lệ" });
    }

    // Kiểm tra yêu cầu ra/vào tồn tại
    const visit = await VisitRequest.findById(visitRequestId);
    if (!visit) {
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });
    }

    // Chỉ được thêm hành lý khi đã check-in hoặc đang ở trạng thái CHECKED_IN, OVERDUE
    if (!["CHECKED_IN", "OVERDUE"].includes(visit.status)) {
      return res.status(400).json({
        message: "Chỉ được thêm hành lý sau khi khách đã check-in",
      });
    }

    // Sinh tracking code
    let trackingCode = generateTrackingCode();
    let existing = await Luggage.findOne({ trackingCode });
    while (existing) {
      trackingCode = generateTrackingCode();
      existing = await Luggage.findOne({ trackingCode });
    }

    // Tạo hành lý
    const luggage = await Luggage.create({
      visitRequest: visitRequestId,
      itemName: itemName.trim(),
      description: description ? description.trim() : null,
      quantity: quantity || 1,
      itemType: itemType || "PERSONAL_ITEM",
      estimatedValue: estimatedValue || null,
      itemImageData: itemImageData || null,
      trackingCode,
      checkedInBy: req.userId,
      checkedInAt: new Date(),
    });

    await logAudit(req, "LUGGAGE_ADDED", "Luggage", luggage._id, {
      visitRequestId,
      itemName: luggage.itemName,
      trackingCode,
    });

    return res.status(201).json({
      message: "Thêm hành lý thành công",
      luggage,
    });
  } catch (error) {
    console.error("[Luggage] Error adding luggage:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Lấy danh sách hành lý theo yêu cầu ra/vào
 */
export const getLuggageByVisit = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const { visitRequestId } = req.params;

    if (!visitRequestId || !mongoose.Types.ObjectId.isValid(visitRequestId)) {
      return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
    }

    const luggage = await Luggage.find({ visitRequest: visitRequestId })
      .populate("checkedInBy", "displayName idCompanny")
      .populate("checkedOutBy", "displayName idCompanny")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      visitRequestId,
      count: luggage.length,
      items: luggage,
    });
  } catch (error) {
    console.error("[Luggage] Error fetching luggage:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Check-out hành lý (ghi nhận người mang ra)
 */
export const checkOutLuggage = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const { luggageId } = req.params;
    const { returnImageData, notes } = req.body;

    if (!luggageId || !mongoose.Types.ObjectId.isValid(luggageId)) {
      return res.status(400).json({ message: "ID hành lý không hợp lệ" });
    }

    const luggage = await Luggage.findById(luggageId).populate("visitRequest");
    if (!luggage) {
      return res.status(404).json({ message: "Hành lý không tồn tại" });
    }

    // Chỉ được check-out hành lý đang ở trạng thái CHECKED_IN
    if (luggage.status !== "CHECKED_IN") {
      return res.status(400).json({
        message: `Hành lý đang ở trạng thái ${luggage.status}, không thể check-out`,
      });
    }

    // Cập nhật thông tin check-out
    luggage.status = "CHECKED_OUT";
    luggage.checkedOutBy = req.userId;
    luggage.checkedOutAt = new Date();
    if (returnImageData) {
      luggage.returnImageData = returnImageData;
    }
    if (notes) {
      luggage.notes = notes.trim();
    }
    await luggage.save();

    await logAudit(req, "LUGGAGE_CHECKED_OUT", "Luggage", luggageId, {
      visitRequestId: luggage.visitRequest._id,
      itemName: luggage.itemName,
      trackingCode: luggage.trackingCode,
    });

    return res.status(200).json({
      message: "Check-out hành lý thành công",
      luggage,
    });
  } catch (error) {
    console.error("[Luggage] Error checking out luggage:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Cập nhật trạng thái hành lý (mất, hư, trả lại)
 */
export const updateLuggageStatus = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const { luggageId } = req.params;
    const { status, notes } = req.body;

    if (!luggageId || !mongoose.Types.ObjectId.isValid(luggageId)) {
      return res.status(400).json({ message: "ID hành lý không hợp lệ" });
    }

    if (!status) {
      return res
        .status(400)
        .json({ message: "Trạng thái không được để trống" });
    }

    if (
      !["CHECKED_IN", "CHECKED_OUT", "LOST", "DAMAGED", "RETURNED"].includes(
        status,
      )
    ) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const luggage = await Luggage.findById(luggageId);
    if (!luggage) {
      return res.status(404).json({ message: "Hành lý không tồn tại" });
    }

    const oldStatus = luggage.status;
    luggage.status = status;
    if (notes) {
      luggage.notes = notes.trim();
    }
    await luggage.save();

    await logAudit(req, "LUGGAGE_STATUS_UPDATED", "Luggage", luggageId, {
      oldStatus,
      newStatus: status,
      itemName: luggage.itemName,
    });

    return res.status(200).json({
      message: `Cập nhật trạng thái thành công: ${status}`,
      luggage,
    });
  } catch (error) {
    console.error("[Luggage] Error updating luggage status:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Xóa hành lý (chỉ khi khách vừa mới thêm, chưa check-out)
 */
export const deleteLuggage = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền xóa" });
    }

    const { luggageId } = req.params;

    if (!luggageId || !mongoose.Types.ObjectId.isValid(luggageId)) {
      return res.status(400).json({ message: "ID hành lý không hợp lệ" });
    }

    const luggage = await Luggage.findById(luggageId);
    if (!luggage) {
      return res.status(404).json({ message: "Hành lý không tồn tại" });
    }

    // Chỉ được xóa hành lý mới check-in (chưa check-out)
    if (luggage.status !== "CHECKED_IN") {
      return res.status(400).json({
        message: "Chỉ được xóa hành lý đang ở trạng thái check-in",
      });
    }

    const trackingCode = luggage.trackingCode;
    const itemName = luggage.itemName;
    await Luggage.deleteOne({ _id: luggageId });

    await logAudit(req, "LUGGAGE_DELETED", "Luggage", luggageId, {
      itemName,
      trackingCode,
    });

    return res.status(200).json({
      message: "Xóa hành lý thành công",
    });
  } catch (error) {
    console.error("[Luggage] Error deleting luggage:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Lấy danh sách tất cả hành lý (có bộ lọc)
 */
export const getAllLuggage = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const {
      status,
      visitRequestId,
      itemType,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (visitRequestId && mongoose.Types.ObjectId.isValid(visitRequestId)) {
      filter.visitRequest = visitRequestId;
    }
    if (itemType) filter.itemType = itemType;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * pageSize;

    const luggage = await Luggage.find(filter)
      .populate("visitRequest", "requestCode visitorName status")
      .populate("checkedInBy", "displayName idCompanny")
      .populate("checkedOutBy", "displayName idCompanny")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Luggage.countDocuments(filter);

    return res.status(200).json({
      data: luggage,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[Luggage] Error fetching all luggage:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Lấy thống kê hành lý
 */
export const getLuggageStats = async (req, res) => {
  try {
    if (!isGateRole(req.userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    const stats = await Luggage.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$estimatedValue" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byType = await Luggage.aggregate([
      {
        $group: {
          _id: "$itemType",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      byStatus: stats,
      byType,
    });
  } catch (error) {
    console.error("[Luggage] Error fetching stats:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
