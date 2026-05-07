const express = require("express");
const router = express.Router();
const MealInventoryController = require("../controllers/mealInventoryController");
const authMiddleware = require("../middlewares/authMiddleware");

// Áp dụng middleware xác thực cho tất cả routes
router.use(authMiddleware);

// GET - Lấy danh sách tồn kho
router.get("/", MealInventoryController.getAll);

// GET - Lấy chi tiết tồn kho
router.get("/:id", MealInventoryController.getById);

// GET - Lấy danh sách tồn kho thấp
router.get("/low-stock", MealInventoryController.getLowStock);

// GET - Lấy số lượng có sẵn
router.get("/available/:meal_id", MealInventoryController.getAvailableQuantity);

// POST - Tạo tồn kho mới
router.post("/", MealInventoryController.create);

// PUT - Cập nhật tồn kho
router.put("/:id", MealInventoryController.update);

// POST - Nhập kho
router.post("/:id/import", MealInventoryController.import);

// POST - Xuất kho
router.post("/:id/export", MealInventoryController.export);

// DELETE - Xóa tồn kho
router.delete("/:id", MealInventoryController.delete);

module.exports = router;
