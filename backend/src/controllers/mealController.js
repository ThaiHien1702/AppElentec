import mongoose from "mongoose";
import Meal from "../models/Meal.js";
import MealDistribution from "../models/MealDistribution.js";
import User from "../models/User.js";
import ExcelJS from "exceljs";

// ==================== QUẢN LÝ SUẤT ĂN (MEAL CRUD) ====================

// Tạo suất ăn mới
export const createMeal = async (req, res) => {
  try {
    const { code, name, description, price, category, supplier, status, startTime, endTime } = req.body;

    const existingMeal = await Meal.findOne({ code: code.toUpperCase() });
    if (existingMeal) {
      return res.status(400).json({ message: "Mã suất ăn đã tồn tại" });
    }

    const meal = new Meal({ code, name, description, price, category, supplier, status, startTime, endTime });
    await meal.save();

    return res.status(201).json({ message: "Tạo suất ăn thành công", meal });
  } catch (error) {
    console.error("Lỗi khi tạo suất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách suất ăn
export const getAllMeals = async (req, res) => {
  try {
    const { category, status } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const meals = await Meal.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ meals });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách suất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy suất ăn theo ID
export const getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Suất ăn không tồn tại" });
    return res.status(200).json(meal);
  } catch (error) {
    console.error("Lỗi khi lấy suất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật suất ăn
export const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!meal) return res.status(404).json({ message: "Suất ăn không tồn tại" });
    return res.status(200).json({ message: "Cập nhật suất ăn thành công", meal });
  } catch (error) {
    console.error("Lỗi khi cập nhật suất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa suất ăn
export const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ message: "Suất ăn không tồn tại" });
    return res.status(200).json({ message: "Xóa suất ăn thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa suất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ==================== QUẢN LÝ XUẤT ĂN (DISTRIBUTION) ====================

// Tạo xuất ăn mới
export const createDistribution = async (req, res) => {
  try {
    const { employeeId, mealId, quantity, distributionDate, mealTime, notes } = req.body;
    const createdBy = req.userId;

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Nhân viên không tồn tại" });

    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(404).json({ message: "Suất ăn không tồn tại" });

    const totalPrice = meal.price * (quantity || 1);

    const distribution = new MealDistribution({
      employee: employeeId,
      department: employee.department,
      meal: mealId,
      quantity: quantity || 1,
      distributionDate: new Date(distributionDate),
      mealTime: mealTime || "LUNCH",
      totalPrice,
      createdBy,
      notes,
    });

    await distribution.save();
    await distribution.populate("employee", "displayName department position idCompanny");
    await distribution.populate("meal", "name code price category");

    return res.status(201).json({ message: "Tạo xuất ăn thành công", distribution });
  } catch (error) {
    console.error("Lỗi khi tạo xuất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách xuất ăn của user hiện tại
export const getMyDistributions = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { employee: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const distributions = await MealDistribution.find(query)
      .populate("meal", "name code price category")
      .populate("confirmedBy", "displayName")
      .sort({ distributionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MealDistribution.countDocuments(query);

    return res.status(200).json({
      distributions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách xuất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy tất cả xuất ăn (admin/moderator)
export const getAllDistributions = async (req, res) => {
  try {
    const { status, employee, department, mealTime, date, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (employee) query.employee = employee;
    if (department) query.department = department;
    if (mealTime) query.mealTime = mealTime;
    if (date) {
      const d = new Date(date);
      query.distributionDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const skip = (page - 1) * limit;
    const distributions = await MealDistribution.find(query)
      .populate("employee", "displayName department position idCompanny")
      .populate("meal", "name code price category")
      .populate("confirmedBy", "displayName")
      .sort({ distributionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MealDistribution.countDocuments(query);

    return res.status(200).json({
      distributions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách xuất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy xuất ăn theo ID
export const getDistributionById = async (req, res) => {
  try {
    const distribution = await MealDistribution.findById(req.params.id)
      .populate("employee", "displayName department position idCompanny")
      .populate("meal", "name code price category")
      .populate("confirmedBy", "displayName")
      .populate("createdBy", "displayName");

    if (!distribution) return res.status(404).json({ message: "Xuất ăn không tồn tại" });
    return res.status(200).json(distribution);
  } catch (error) {
    console.error("Lỗi khi lấy xuất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xác nhận xuất ăn
export const confirmDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const distribution = await MealDistribution.findById(id);
    if (!distribution) return res.status(404).json({ message: "Xuất ăn không tồn tại" });
    if (distribution.status !== "PENDING") return res.status(400).json({ message: "Xuất ăn đã được xử lý" });

    distribution.status = "CONFIRMED";
    distribution.confirmedBy = req.userId;
    distribution.confirmedAt = new Date();
    if (notes) distribution.notes = notes;

    await distribution.save();
    await distribution.populate("employee", "displayName department position");
    await distribution.populate("meal", "name code price category");
    await distribution.populate("confirmedBy", "displayName");

    return res.status(200).json({ message: "Xác nhận xuất ăn thành công", distribution });
  } catch (error) {
    console.error("Lỗi khi xác nhận xuất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Đánh dấu đã phát suất ăn
export const serveDistribution = async (req, res) => {
  try {
    const distribution = await MealDistribution.findById(req.params.id);
    if (!distribution) return res.status(404).json({ message: "Xuất ăn không tồn tại" });
    if (distribution.status !== "CONFIRMED") return res.status(400).json({ message: "Xuất ăn chưa được xác nhận" });

    distribution.status = "SERVED";
    await distribution.save();

    return res.status(200).json({ message: "Đã phát suất ăn", distribution });
  } catch (error) {
    console.error("Lỗi khi phát suất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Hủy xuất ăn
export const cancelDistribution = async (req, res) => {
  try {
    const distribution = await MealDistribution.findById(req.params.id);
    if (!distribution) return res.status(404).json({ message: "Xuất ăn không tồn tại" });

    if (distribution.status === "SERVED") return res.status(400).json({ message: "Không thể hủy xuất ăn đã phát" });

    distribution.status = "CANCELLED";
    await distribution.save();

    return res.status(200).json({ message: "Hủy xuất ăn thành công", distribution });
  } catch (error) {
    console.error("Lỗi khi hủy xuất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ==================== THỐNG KÊ ====================

// Thống kê xuất ăn
export const getMealStats = async (req, res) => {
  try {
    const { from, to, department } = req.query;
    const userId = req.userId;
    const userRole = req.userRole;
    const isAdminOrMod = userRole === "admin" || userRole === "moderator";

    let matchFilter = {};

    // Date filter
    if (from || to) {
      matchFilter.distributionDate = {};
      if (from) matchFilter.distributionDate.$gte = new Date(from);
      if (to) matchFilter.distributionDate.$lte = new Date(to + "T23:59:59");
    }

    // Department filter
    if (isAdminOrMod && department && department !== "all") {
      matchFilter.department = department;
    } else if (!isAdminOrMod) {
      matchFilter.employee = new mongoose.Types.ObjectId(userId);
    }

    const [summary, byCategory, byDepartment, byMealTime] = await Promise.all([
      // Tổng hợp chung
      MealDistribution.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalDistributions: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" },
            totalCost: { $sum: "$totalPrice" },
            pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
            confirmed: { $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] } },
            served: { $sum: { $cond: [{ $eq: ["$status", "SERVED"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
          },
        },
      ]),
      // Theo danh mục
      MealDistribution.aggregate([
        { $match: { ...matchFilter, status: { $ne: "CANCELLED" } } },
        { $lookup: { from: "meals", localField: "meal", foreignField: "_id", as: "mealInfo" } },
        { $unwind: "$mealInfo" },
        { $group: { _id: "$mealInfo.category", count: { $sum: "$quantity" }, cost: { $sum: "$totalPrice" } } },
        { $sort: { count: -1 } },
      ]),
      // Theo phòng ban (chỉ admin/mod)
      isAdminOrMod
        ? MealDistribution.aggregate([
            { $match: { ...matchFilter, status: { $ne: "CANCELLED" } } },
            { $group: { _id: "$department", count: { $sum: "$quantity" }, cost: { $sum: "$totalPrice" } } },
            { $sort: { count: -1 } },
          ])
        : [],
      // Theo bữa ăn
      MealDistribution.aggregate([
        { $match: { ...matchFilter, status: { $ne: "CANCELLED" } } },
        { $group: { _id: "$mealTime", count: { $sum: "$quantity" }, cost: { $sum: "$totalPrice" } } },
      ]),
    ]);

    return res.status(200).json({
      summary: summary[0] || { totalDistributions: 0, totalQuantity: 0, totalCost: 0, pending: 0, confirmed: 0, served: 0, cancelled: 0 },
      byCategory,
      byDepartment,
      byMealTime,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê xuất ăn:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ==================== EXPORT EXCEL ====================

export const exportMealDistributions = async (req, res) => {
  try {
    const { status, from, to, department } = req.query;

    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (from || to) {
      query.distributionDate = {};
      if (from) query.distributionDate.$gte = new Date(from);
      if (to) query.distributionDate.$lte = new Date(to + "T23:59:59");
    }

    const distributions = await MealDistribution.find(query)
      .populate("employee", "displayName idCompanny department position")
      .populate("meal", "name code price category")
      .populate("confirmedBy", "displayName")
      .sort({ distributionDate: -1 })
      .lean();

    const MEAL_TIMES = { BREAKFAST: "Sáng", LUNCH: "Trưa", DINNER: "Tối" };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Xuất ăn");

    const headers = ["No.", "Mã NV", "Tên nhân viên", "Phòng ban", "Suất ăn", "Danh mục", "Bữa", "Số lượng", "Đơn giá", "Tổng tiền", "Ngày xuất ăn", "Trạng thái", "Người xác nhận", "Ghi chú"];

    worksheet.columns = headers.map((h) => ({ header: h, width: h === "No." ? 5 : 15 }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FF1F3A5F" }, size: 11 };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB8D2EA" } };
    headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    distributions.forEach((item, index) => {
      worksheet.addRow({
        "No.": index + 1,
        "Mã NV": item.employee?.idCompanny || "",
        "Tên nhân viên": item.employee?.displayName || "",
        "Phòng ban": item.employee?.department || "",
        "Suất ăn": item.meal?.name || "",
        "Danh mục": item.meal?.category || "",
        "Bữa": MEAL_TIMES[item.mealTime] || item.mealTime,
        "Số lượng": item.quantity,
        "Đơn giá": item.meal?.price || 0,
        "Tổng tiền": item.totalPrice || 0,
        "Ngày xuất ăn": item.distributionDate ? new Date(item.distributionDate).toLocaleDateString("vi-VN") : "",
        "Trạng thái": item.status,
        "Người xác nhận": item.confirmedBy?.displayName || "",
        "Ghi chú": item.notes || "",
      });
    });

    const fileBuffer = await workbook.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Disposition", `attachment; filename=meal-distributions-${timestamp}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Lỗi khi export Excel:", error);
    return res.status(500).json({ message: "Lỗi khi export Excel" });
  }
};
