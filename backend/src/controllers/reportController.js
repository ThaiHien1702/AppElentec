import VisitRequest from "../models/VisitRequest.js";
import Leave from "../models/Leave.js";
import Overtime from "../models/Overtime.js";
import User from "../models/User.js";
import XLSX from "xlsx";

// Vai trò được phép xem báo cáo vận hành cổng.
const REPORT_ROLES = ["admin", "moderator"];

// Chuẩn hóa mốc đầu ngày để lọc dữ liệu theo ngày chính xác.
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Chuẩn hóa mốc cuối ngày để tính đầy đủ dữ liệu trong ngày.
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Guard dùng chung cho toàn bộ API report.
const ensureReportRole = (req, res) => {
  if (!REPORT_ROLES.includes(req.userRole)) {
    res.status(403).json({ message: "Bạn không có quyền truy cập báo cáo" });
    return false;
  }
  return true;
};

// Realtime: trả KPI hiện tại + 10 hoạt động cập nhật gần nhất.
export const getRealtimeReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Chạy song song để giảm thời gian phản hồi dashboard.
    const [
      totalToday,
      pendingApproval,
      approved,
      checkedIn,
      checkedOut,
      rejected,
      cancelled,
      overdue,
      latestActivities,
    ] = await Promise.all([
      VisitRequest.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),
      VisitRequest.countDocuments({ status: "PENDING_APPROVAL" }),
      VisitRequest.countDocuments({ status: "APPROVED" }),
      VisitRequest.countDocuments({ status: "CHECKED_IN" }),
      VisitRequest.countDocuments({
        status: "CHECKED_OUT",
        checkOutAt: { $gte: todayStart, $lte: todayEnd },
      }),
      VisitRequest.countDocuments({
        status: "REJECTED",
        rejectedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      VisitRequest.countDocuments({
        status: "CANCELLED",
        updatedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      VisitRequest.countDocuments({
        $or: [
          { status: "OVERDUE" },
          {
            status: "CHECKED_IN",
            expectedCheckOutAt: { $lt: now },
          },
        ],
      }),
      VisitRequest.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .select(
          "requestCode visitorName status purpose expectedCheckInAt expectedCheckOutAt checkInAt checkOutAt updatedAt",
        ),
    ]);

    return res.status(200).json({
      generatedAt: now,
      summary: {
        totalToday,
        pendingApproval,
        approved,
        checkedIn,
        checkedOut,
        rejected,
        cancelled,
        overdue,
      },
      latestActivities,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo realtime", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getDailyReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    // Mặc định lấy 7 ngày gần nhất nếu người dùng chưa chọn khoảng ngày.
    const now = new Date();
    const from = req.query.from
      ? startOfDay(new Date(req.query.from))
      : startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const to = req.query.to ? endOfDay(new Date(req.query.to)) : endOfDay(now);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Tham số ngày không hợp lệ" });
    }

    if (from > to) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc" });
    }

    // Gom nhóm theo ngày + trạng thái để frontend vẽ bảng theo ngày.
    const grouped = await VisitRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: 1,
        },
      },
      {
        $group: {
          _id: { day: "$day", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.day": 1,
        },
      },
    ]);

    // Chuẩn hóa kết quả thành một dòng/ngày với đầy đủ cột trạng thái.
    const dayMap = new Map();
    for (const row of grouped) {
      const day = row._id.day;
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          day,
          total: 0,
          PENDING_APPROVAL: 0,
          APPROVED: 0,
          REJECTED: 0,
          CHECKED_IN: 0,
          CHECKED_OUT: 0,
          OVERDUE: 0,
          CANCELLED: 0,
        });
      }
      const item = dayMap.get(day);
      item[row._id.status] = row.count;
      item.total += row.count;
    }

    const data = Array.from(dayMap.values());

    return res.status(200).json({
      from,
      to,
      totalDays: data.length,
      data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo ngày", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getOverdueReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();

    // Overdue gồm cả hồ sơ đã gắn OVERDUE và hồ sơ CHECKED_IN nhưng quá giờ.
    const rows = await VisitRequest.find({
      $or: [
        { status: "OVERDUE" },
        {
          status: "CHECKED_IN",
          expectedCheckOutAt: { $lt: now },
        },
      ],
    })
      .sort({ expectedCheckOutAt: 1 })
      .populate("requestedBy", "displayName idCompanny department")
      .select(
        "requestCode visitorName visitorPhone visitorCompany purpose hostName areaAllowed status expectedCheckOutAt checkInAt requestedBy",
      );

    // Tính số phút trễ để hỗ trợ ưu tiên xử lý trên UI.
    const data = rows.map((item) => {
      const overdueMinutes = Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(item.expectedCheckOutAt).getTime()) / 60000,
        ),
      );

      return {
        _id: item._id,
        requestCode: item.requestCode,
        visitorName: item.visitorName,
        visitorPhone: item.visitorPhone,
        visitorCompany: item.visitorCompany,
        purpose: item.purpose,
        hostName: item.hostName,
        areaAllowed: item.areaAllowed,
        status: item.status,
        checkInAt: item.checkInAt,
        expectedCheckOutAt: item.expectedCheckOutAt,
        overdueMinutes,
        requestedBy: item.requestedBy,
      };
    });

    return res.status(200).json({
      generatedAt: now,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo overdue", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Export: xuất báo cáo theo khoảng ngày, hỗ trợ csv hoặc excel.
export const exportAccessReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const from = req.query.from
      ? startOfDay(new Date(req.query.from))
      : startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const to = req.query.to ? endOfDay(new Date(req.query.to)) : endOfDay(now);
    const type = (req.query.type || "excel").toLowerCase();

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Tham số ngày không hợp lệ" });
    }

    if (from > to) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc" });
    }

    const visits = await VisitRequest.find({
      createdAt: { $gte: from, $lte: to },
    })
      .sort({ createdAt: -1 })
      .select(
        "requestCode visitorName visitorPhone visitorCompany purpose hostName areaAllowed status expectedCheckInAt expectedCheckOutAt checkInAt checkOutAt createdAt",
      );

    const rows = visits.map((item) => ({
      requestCode: item.requestCode,
      visitorName: item.visitorName,
      visitorPhone: item.visitorPhone,
      visitorCompany: item.visitorCompany || "",
      purpose: item.purpose,
      hostName: item.hostName,
      areaAllowed: item.areaAllowed,
      status: item.status,
      expectedCheckInAt: item.expectedCheckInAt,
      expectedCheckOutAt: item.expectedCheckOutAt,
      checkInAt: item.checkInAt || "",
      checkOutAt: item.checkOutAt || "",
      createdAt: item.createdAt,
    }));

    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    if (type === "csv") {
      const headers = [
        "requestCode",
        "visitorName",
        "visitorPhone",
        "visitorCompany",
        "purpose",
        "hostName",
        "areaAllowed",
        "status",
        "expectedCheckInAt",
        "expectedCheckOutAt",
        "checkInAt",
        "checkOutAt",
        "createdAt",
      ];

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((key) => {
              const value = row[key] ?? "";
              const safe = String(value).replace(/"/g, '""');
              return `"${safe}"`;
            })
            .join(","),
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="access-report-${stamp}.csv"`,
      );
      return res.status(200).send(`\uFEFF${csv}`);
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "AccessReport");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="access-report-${stamp}.xlsx"`,
    );
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Lỗi khi export báo cáo", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Leave Report: realtime statistics about leave requests
export const getLeaveRealtimeReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalToday,
      pendingApproval,
      approved,
      rejected,
      cancelled,
      latestActivities,
    ] = await Promise.all([
      Leave.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),
      Leave.countDocuments({ status: "PENDING" }),
      Leave.countDocuments({ status: "APPROVED" }),
      Leave.countDocuments({ status: "REJECTED" }),
      Leave.countDocuments({ status: "CANCELLED" }),
      Leave.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("user", "displayName email")
        .populate("approvedBy", "displayName")
        .select(
          "user leaveType startDate endDate status approvedBy approvedAt updatedAt",
        ),
    ]);

    return res.status(200).json({
      generatedAt: now,
      summary: {
        totalToday,
        pendingApproval,
        approved,
        rejected,
        cancelled,
      },
      latestActivities,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo realtime nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Leave Report: daily breakdown
export const getLeaveDailyReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const from = req.query.from
      ? startOfDay(new Date(req.query.from))
      : startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const to = req.query.to ? endOfDay(new Date(req.query.to)) : endOfDay(now);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Tham số ngày không hợp lệ" });
    }

    if (from > to) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc" });
    }

    // Group by date and status
    const grouped = await Leave.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: 1,
        },
      },
      {
        $group: {
          _id: { day: "$day", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.day": 1,
        },
      },
    ]);

    // Normalize results to one row per day with all status columns
    const dayMap = new Map();
    for (const row of grouped) {
      const day = row._id.day;
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          day,
          total: 0,
          PENDING: 0,
          APPROVED: 0,
          REJECTED: 0,
          CANCELLED: 0,
        });
      }
      const item = dayMap.get(day);
      item[row._id.status] = row.count;
      item.total += row.count;
    }

    const data = Array.from(dayMap.values());

    return res.status(200).json({
      from,
      to,
      totalDays: data.length,
      data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo ngày nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Leave Report: pending approvals (similar to overdue)
export const getLeavePendingReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();

    const rows = await Leave.find({
      status: "PENDING",
    })
      .sort({ startDate: 1 })
      .populate("user", "displayName email idCompanny department")
      .select(
        "user leaveType startDate endDate daysCount reason status createdAt",
      );

    // Calculate days pending to prioritize urgent approvals
    const data = rows.map((item) => {
      const daysPending = Math.floor(
        (now.getTime() - new Date(item.createdAt).getTime()) /
          (24 * 60 * 60 * 1000),
      );

      return {
        _id: item._id,
        user: item.user,
        leaveType: item.leaveType,
        startDate: item.startDate,
        endDate: item.endDate,
        daysCount: item.daysCount,
        reason: item.reason,
        status: item.status,
        createdAt: item.createdAt,
        daysPending,
      };
    });

    return res.status(200).json({
      generatedAt: now,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo yêu cầu chờ duyệt", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Leave Report: export to Excel/CSV
export const exportLeaveReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const from = req.query.from
      ? startOfDay(new Date(req.query.from))
      : startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const to = req.query.to ? endOfDay(new Date(req.query.to)) : endOfDay(now);
    const type = (req.query.type || "excel").toLowerCase();

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Tham số ngày không hợp lệ" });
    }

    if (from > to) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc" });
    }

    const leaves = await Leave.find({
      createdAt: { $gte: from, $lte: to },
    })
      .sort({ createdAt: -1 })
      .populate("user", "displayName email idCompanny department");

    const rows = leaves.map((item) => ({
      displayName: item.user?.displayName || "N/A",
      email: item.user?.email || "N/A",
      department: item.user?.department || "N/A",
      leaveType: item.leaveType,
      startDate: new Date(item.startDate).toLocaleDateString("vi-VN"),
      endDate: new Date(item.endDate).toLocaleDateString("vi-VN"),
      daysCount: item.daysCount,
      reason: item.reason,
      status: item.status,
      createdAt: new Date(item.createdAt).toLocaleString("vi-VN"),
    }));

    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    if (type === "csv") {
      const headers = [
        "displayName",
        "email",
        "department",
        "leaveType",
        "startDate",
        "endDate",
        "daysCount",
        "reason",
        "status",
        "createdAt",
      ];

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((key) => {
              const value = row[key] ?? "";
              const safe = String(value).replace(/"/g, '""');
              return `"${safe}"`;
            })
            .join(","),
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="leave-report-${stamp}.csv"`,
      );
      return res.status(200).send(`\uFEFF${csv}`);
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "LeaveReport");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="leave-report-${stamp}.xlsx"`,
    );
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Lỗi khi export báo cáo nghỉ phép", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Overtime Report: realtime statistics
export const getOvertimeRealtimeReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalToday,
      pendingApproval,
      approved,
      completed,
      rejected,
      cancelled,
      latestActivities,
    ] = await Promise.all([
      Overtime.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),
      Overtime.countDocuments({ status: "PENDING" }),
      Overtime.countDocuments({ status: "APPROVED" }),
      Overtime.countDocuments({ status: "COMPLETED" }),
      Overtime.countDocuments({ status: "REJECTED" }),
      Overtime.countDocuments({ status: "CANCELLED" }),
      Overtime.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("user", "displayName email")
        .select(
          "user checkInDate checkInTime checkOutTime status approvedBy approvedAt updatedAt",
        ),
    ]);

    return res.status(200).json({
      generatedAt: now,
      summary: {
        totalToday,
        pendingApproval,
        approved,
        completed,
        rejected,
        cancelled,
      },
      latestActivities,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo realtime giờ làm thêm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Overtime Report: daily breakdown
export const getOvertimeDailyReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const from = req.query.from
      ? startOfDay(new Date(req.query.from))
      : startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const to = req.query.to ? endOfDay(new Date(req.query.to)) : endOfDay(now);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Tham số ngày không hợp lệ" });
    }

    if (from > to) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc" });
    }

    // Group by date and status
    const grouped = await Overtime.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          status: 1,
        },
      },
      {
        $group: {
          _id: { day: "$day", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.day": 1,
        },
      },
    ]);

    // Normalize results to one row per day with all status columns
    const dayMap = new Map();
    for (const row of grouped) {
      const day = row._id.day;
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          day,
          total: 0,
          PENDING: 0,
          APPROVED: 0,
          COMPLETED: 0,
          REJECTED: 0,
          CANCELLED: 0,
        });
      }
      const item = dayMap.get(day);
      item[row._id.status] = row.count;
      item.total += row.count;
    }

    const data = Array.from(dayMap.values());

    return res.status(200).json({
      from,
      to,
      totalDays: data.length,
      data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo ngày giờ làm thêm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Overtime Report: pending approvals
export const getOvertimePendingReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();

    const rows = await Overtime.find({
      status: "PENDING",
    })
      .sort({ checkInDate: 1 })
      .populate("user", "displayName email idCompanny department")
      .select(
        "user checkInDate checkInTime checkOutTime reason status createdAt",
      );

    // Calculate days pending to prioritize urgent approvals
    const data = rows.map((item) => {
      const daysPending = Math.floor(
        (now.getTime() - new Date(item.createdAt).getTime()) /
          (24 * 60 * 60 * 1000),
      );

      return {
        _id: item._id,
        user: item.user,
        checkInDate: item.checkInDate,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime,
        reason: item.reason,
        status: item.status,
        createdAt: item.createdAt,
        daysPending,
      };
    });

    return res.status(200).json({
      generatedAt: now,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo yêu cầu chờ duyệt OT", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Overtime Report: export to Excel/CSV
export const exportOvertimeReport = async (req, res) => {
  try {
    if (!ensureReportRole(req, res)) return;

    const now = new Date();
    const from = req.query.from
      ? startOfDay(new Date(req.query.from))
      : startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const to = req.query.to ? endOfDay(new Date(req.query.to)) : endOfDay(now);
    const type = (req.query.type || "excel").toLowerCase();

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Tham số ngày không hợp lệ" });
    }

    if (from > to) {
      return res
        .status(400)
        .json({ message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc" });
    }

    const overtimes = await Overtime.find({
      createdAt: { $gte: from, $lte: to },
    })
      .sort({ createdAt: -1 })
      .populate("user", "displayName email idCompanny department");

    const rows = overtimes.map((item) => ({
      displayName: item.user?.displayName || "N/A",
      email: item.user?.email || "N/A",
      department: item.user?.department || "N/A",
      checkInDate: new Date(item.checkInDate).toLocaleDateString("vi-VN"),
      checkInTime: item.checkInTime || "N/A",
      checkOutTime: item.checkOutTime || "N/A",
      reason: item.reason || "N/A",
      status: item.status,
      createdAt: new Date(item.createdAt).toLocaleString("vi-VN"),
    }));

    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    if (type === "csv") {
      const headers = [
        "displayName",
        "email",
        "department",
        "checkInDate",
        "checkInTime",
        "checkOutTime",
        "reason",
        "status",
        "createdAt",
      ];

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((key) => {
              const value = row[key] ?? "";
              const safe = String(value).replace(/"/g, '""');
              return `"${safe}"`;
            })
            .join(","),
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="overtime-report-${stamp}.csv"`,
      );
      return res.status(200).send(`\uFEFF${csv}`);
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "OvertimeReport");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="overtime-report-${stamp}.xlsx"`,
    );
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Lỗi khi export báo cáo giờ làm thêm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
