const express = require("express");
const router = express.Router();
const MealDistributionController = require("../controllers/mealDistributionController");
const authMiddleware = require("../middlewares/authMiddleware");

// Áp dụng middleware xác thực cho tất cả routes
router.use(authMiddleware);

// GET - Lấy danh sách xuất ăn
router.get("/", MealDistributionController.getAll);

// GET - Lấy chi tiết xuất ăn
router.get("/:id", MealDistributionController.getById);

// GET - Lấy xuất ăn của nhân viên theo ngày
router.get(
  "/by-employee/:employee_id/:date",
  MealDistributionController.getByEmployeeAndDate,
);

// GET - Lấy tổng xuất ăn theo ngày
router.get("/stats/date/:date", MealDistributionController.getStatsByDate);

// GET - Lấy tổng xuất ăn theo tháng
router.get(
  "/stats/month/:year/:month",
  MealDistributionController.getStatsByMonth,
);

// GET - Lấy tổng xuất ăn theo phòng ban
router.get(
  "/stats/department",
  MealDistributionController.getStatsByDepartment,
);

// POST - Tạo xuất ăn mới
router.post("/", MealDistributionController.create);

// PUT - Cập nhật xuất ăn
router.put("/:id", MealDistributionController.update);

// PUT - Xác nhận xuất ăn
router.put("/:id/confirm", MealDistributionController.confirm);

// PUT - Cập nhật trạng thái
router.put("/:id/status", MealDistributionController.updateStatus);

// DELETE - Xóa xuất ăn
router.delete("/:id", MealDistributionController.delete);

module.exports = router;
