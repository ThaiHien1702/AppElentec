const express = require("express");
const router = express.Router();
const MealController = require("../controllers/mealController");
const authMiddleware = require("../middlewares/authMiddleware");

// Áp dụng middleware xác thực cho tất cả routes
router.use(authMiddleware);

// GET - Lấy danh sách suất ăn
router.get("/", MealController.getAll);

// GET - Lấy chi tiết suất ăn
router.get("/:id", MealController.getById);

// GET - Lấy suất ăn theo danh mục
router.get("/category/:category", MealController.getByCategory);

// POST - Tạo suất ăn mới (Admin, Canteen Manager)
router.post("/", MealController.create);

// PUT - Cập nhật suất ăn (Admin, Canteen Manager)
router.put("/:id", MealController.update);

// PUT - Cập nhật trạng thái suất ăn
router.put("/:id/status", MealController.updateStatus);

// DELETE - Xóa suất ăn (Admin)
router.delete("/:id", MealController.delete);

module.exports = router;
