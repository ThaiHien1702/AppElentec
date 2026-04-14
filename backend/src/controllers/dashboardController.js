import User from "../models/User.js";
import Leave from "../models/Leave.js";
import Overtime from "../models/Overtime.js";
import VisitRequest from "../models/VisitRequest.js";
import Luggage from "../models/Luggage.js";

/**
 * Thống kê tổng hợp theo bộ phận.
 * - User thường: chỉ thấy thống kê bộ phận của mình.
 * - Admin/Moderator: thấy tất cả hoặc lọc theo ?department=...
 */
export const getDepartmentStats = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const isAdminOrMod = userRole === "admin" || userRole === "moderator";

    // Xác định department cần thống kê
    let targetDepartment = null;
    if (isAdminOrMod) {
      // Admin có thể lọc theo department, hoặc xem tất cả (department=all)
      targetDepartment = req.query.department || "all";
    } else {
      // User thường chỉ xem bộ phận của mình
      const currentUser = await User.findById(userId).select("department");
      if (!currentUser || !currentUser.department) {
        return res.status(200).json({
          department: null,
          message: "Bạn chưa được gán bộ phận",
          leave: { total: 0, pending: 0, approved: 0, rejected: 0 },
          overtime: { total: 0, pending: 0, approved: 0, completed: 0 },
          visits: { total: 0, pendingApproval: 0, approved: 0, checkedIn: 0, checkedOut: 0 },
          luggage: { total: 0, checkedIn: 0, checkedOut: 0 },
        });
      }
      targetDepartment = currentUser.department;
    }

    // Tìm user IDs trong department
    let userFilter = {};
    let departmentLabel = "Tất cả bộ phận";

    if (targetDepartment !== "all") {
      const usersInDept = await User.find({ department: targetDepartment }).select("_id");
      const userIds = usersInDept.map((u) => u._id);
      userFilter = { $in: userIds };
      departmentLabel = targetDepartment;
    }

    // Thống kê song song
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01`);
    const yearEnd = new Date(`${currentYear}-12-31T23:59:59`);

    const leaveFilter = targetDepartment === "all" ? {} : { user: userFilter };
    const otFilter = targetDepartment === "all" ? {} : { user: userFilter };
    const visitFilter = targetDepartment === "all" ? {} : { requestedBy: userFilter };
    
    let luggageQuery = {};
    if (targetDepartment !== "all") {
      const relatedVisits = await VisitRequest.find({ requestedBy: userFilter }).select("_id");
      const visitIds = relatedVisits.map((v) => v._id);
      luggageQuery = { visitRequest: { $in: visitIds } };
    }

    const [
      leaveTotal,
      leavePending,
      leaveApproved,
      leaveRejected,
      otTotal,
      otPending,
      otApproved,
      otCompleted,
      visitTotal,
      visitPending,
      visitApproved,
      visitCheckedIn,
      visitCheckedOut,
      luggageTotal,
      luggageIn,
      luggageOut,
    ] = await Promise.all([
      // Leave stats
      Leave.countDocuments({ ...leaveFilter, createdAt: { $gte: yearStart, $lte: yearEnd } }),
      Leave.countDocuments({ ...leaveFilter, status: "PENDING" }),
      Leave.countDocuments({ ...leaveFilter, status: "APPROVED", createdAt: { $gte: yearStart, $lte: yearEnd } }),
      Leave.countDocuments({ ...leaveFilter, status: "REJECTED", createdAt: { $gte: yearStart, $lte: yearEnd } }),
      // Overtime stats
      Overtime.countDocuments({ ...otFilter, createdAt: { $gte: yearStart, $lte: yearEnd } }),
      Overtime.countDocuments({ ...otFilter, status: "PENDING" }),
      Overtime.countDocuments({ ...otFilter, status: "APPROVED" }),
      Overtime.countDocuments({ ...otFilter, status: "COMPLETED" }),
      // Visit stats
      VisitRequest.countDocuments({ ...visitFilter, createdAt: { $gte: yearStart, $lte: yearEnd } }),
      VisitRequest.countDocuments({ ...visitFilter, status: "PENDING_APPROVAL" }),
      VisitRequest.countDocuments({ ...visitFilter, status: "APPROVED" }),
      VisitRequest.countDocuments({ ...visitFilter, status: "CHECKED_IN" }),
      VisitRequest.countDocuments({ ...visitFilter, status: "CHECKED_OUT", createdAt: { $gte: yearStart, $lte: yearEnd } }),
      // Luggage stats
      Luggage.countDocuments(luggageQuery),
      Luggage.countDocuments({ ...luggageQuery, status: "CHECKED_IN" }),
      Luggage.countDocuments({ ...luggageQuery, status: "CHECKED_OUT" }),
    ]);

    // Lấy danh sách departments cho admin filter
    let departments = [];
    if (isAdminOrMod) {
      departments = await User.distinct("department", { department: { $ne: null, $ne: "" } });
      departments = departments.filter(Boolean).sort();
    }

    return res.status(200).json({
      department: departmentLabel,
      departments, // Danh sách departments cho dropdown (chỉ admin)
      year: currentYear,
      leave: {
        total: leaveTotal,
        pending: leavePending,
        approved: leaveApproved,
        rejected: leaveRejected,
      },
      overtime: {
        total: otTotal,
        pending: otPending,
        approved: otApproved,
        completed: otCompleted,
      },
      visits: {
        total: visitTotal,
        pendingApproval: visitPending,
        approved: visitApproved,
        checkedIn: visitCheckedIn,
        checkedOut: visitCheckedOut,
      },
      luggage: {
        total: luggageTotal,
        checkedIn: luggageIn,
        checkedOut: luggageOut,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê bộ phận:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/**
 * Trả về danh sách records gần nhất của một loại cụ thể (leave/overtime/visits/luggage).
 * Scoped theo department giống getDepartmentStats.
 */
export const getDepartmentDetail = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const isAdminOrMod = userRole === "admin" || userRole === "moderator";
    const type = req.params.type; // leave | overtime | visits | luggage
    const limit = parseInt(req.query.limit) || 20;

    // Xác định department
    let targetDepartment = null;
    if (isAdminOrMod) {
      targetDepartment = req.query.department || "all";
    } else {
      const currentUser = await User.findById(userId).select("department");
      targetDepartment = currentUser?.department || null;
    }

    // Build user filter
    let userFilter = {};
    if (targetDepartment && targetDepartment !== "all") {
      const usersInDept = await User.find({ department: targetDepartment }).select("_id");
      userFilter = { $in: usersInDept.map((u) => u._id) };
    }

    const formatStatus = (s) => {
      const map = {
        PENDING: "Chờ duyệt",
        APPROVED: "Đã duyệt",
        REJECTED: "Từ chối",
        CANCELLED: "Đã hủy",
        COMPLETED: "Hoàn thành",
        PENDING_APPROVAL: "Chờ duyệt",
        CHECKED_IN: "Đang trong CT",
        CHECKED_OUT: "Đã check-out",
        OVERDUE: "Quá giờ",
      };
      return map[s] || s;
    };

    let records = [];

    if (type === "leave") {
      const filter = targetDepartment === "all" ? {} : { user: userFilter };
      const data = await Leave.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("user", "displayName idCompanny department position");
      records = data.map((r) => ({
        _id: r._id,
        col1: r.user?.displayName || r.user?.idCompanny || "N/A",
        col2: r.user?.department || "-",
        col3: r.leaveType,
        col4: `${new Date(r.startDate).toLocaleDateString("vi-VN")} → ${new Date(r.endDate).toLocaleDateString("vi-VN")}`,
        col5: `${r.daysCount} ngày`,
        col6: r.reason,
        status: r.status,
        statusLabel: formatStatus(r.status),
        createdAt: r.createdAt,
      }));

    } else if (type === "overtime") {
      const filter = targetDepartment === "all" ? {} : { user: userFilter };
      const data = await Overtime.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("user", "displayName idCompanny department position");
      records = data.map((r) => ({
        _id: r._id,
        col1: r.user?.displayName || r.user?.idCompanny || "N/A",
        col2: r.user?.department || "-",
        col3: new Date(r.checkInDate).toLocaleDateString("vi-VN"),
        col4: `${r.otPlanStart} – ${r.otPlanFinish}`,
        col5: r.otResultStart ? `${r.otResultStart} – ${r.otResultFinish}` : "Chưa có",
        col6: r.reason,
        status: r.status,
        statusLabel: formatStatus(r.status),
        createdAt: r.createdAt,
      }));

    } else if (type === "visits") {
      const filter = targetDepartment === "all" ? {} : { requestedBy: userFilter };
      const data = await VisitRequest.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("requestedBy", "displayName idCompanny department");
      records = data.map((r) => ({
        _id: r._id,
        col1: r.requestCode || "N/A",
        col2: r.requestedBy?.displayName || r.requestedBy?.idCompanny || "N/A",
        col3: r.visitorName || "-",
        col4: r.purpose || "-",
        col5: r.areaAllowed || "-",
        col6: r.hostName || "-",
        status: r.status,
        statusLabel: formatStatus(r.status),
        createdAt: r.createdAt,
      }));

    } else if (type === "luggage") {
      let filter = {};
      if (targetDepartment !== "all" && targetDepartment) {
        const usersInDept = await User.find({ department: targetDepartment }).select("_id");
        const userIds = usersInDept.map((u) => u._id);
        const visits = await VisitRequest.find({ requestedBy: { $in: userIds } }).select("_id requestCode");
        const visitMap = Object.fromEntries(visits.map((v) => [v._id.toString(), v.requestCode]));
        const visitIds = visits.map((v) => v._id);
        filter = { visitRequest: { $in: visitIds } };
        const data = await Luggage.find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("visitRequest", "requestCode visitorName");
        records = data.map((r) => ({
          _id: r._id,
          col1: r.visitRequest?.requestCode || "N/A",
          col2: r.visitRequest?.visitorName || "-",
          col3: r.itemName,
          col4: r.itemType || "-",
          col5: `SL: ${r.quantity}`,
          col6: r.description || "-",
          status: r.status,
          statusLabel: formatStatus(r.status),
          createdAt: r.createdAt,
        }));
      } else {
        const data = await Luggage.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("visitRequest", "requestCode visitorName");
        records = data.map((r) => ({
          _id: r._id,
          col1: r.visitRequest?.requestCode || "N/A",
          col2: r.visitRequest?.visitorName || "-",
          col3: r.itemName,
          col4: r.itemType || "-",
          col5: `SL: ${r.quantity}`,
          col6: r.description || "-",
          status: r.status,
          statusLabel: formatStatus(r.status),
          createdAt: r.createdAt,
        }));
      }
    } else {
      return res.status(400).json({ message: "Loại không hợp lệ" });
    }

    // Column headers per type
    const headers = {
      leave: ["Nhân viên", "Bộ phận", "Loại nghỉ", "Thời gian", "Số ngày", "Lý do"],
      overtime: ["Nhân viên", "Bộ phận", "Ngày OT", "Kế hoạch", "Thực tế", "Lý do"],
      visits: ["Mã yêu cầu", "Người tạo", "Khách", "Mục đích", "Khu vực", "Host"],
      luggage: ["Mã yêu cầu", "Khách", "Tên đồ", "Loại", "Số lượng", "Mô tả"],
    };

    return res.status(200).json({ headers: headers[type], records });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bộ phận:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
