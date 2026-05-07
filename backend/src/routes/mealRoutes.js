import express from "express";
import {
  createMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  createDistribution,
  getMyDistributions,
  getAllDistributions,
  getDistributionById,
  confirmDistribution,
  serveDistribution,
  cancelDistribution,
  getMealStats,
  exportMealDistributions,
} from "../controllers/mealController.js";
import {
  verifyToken,
  isModerator,
  isAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều cần xác thực
router.use(verifyToken);

// ===== Suất ăn (Meal CRUD) =====
router.get("/catalog", getAllMeals); // Danh sách suất ăn
router.get("/catalog/:id", getMealById); // Chi tiết suất ăn
router.post("/catalog", isModerator, createMeal); // Tạo suất ăn
router.put("/catalog/:id", isModerator, updateMeal); // Cập nhật suất ăn
router.delete("/catalog/:id", isAdmin, deleteMeal); // Xóa suất ăn

// ===== Xuất ăn (Distribution) =====
router.post("/distributions", createDistribution); // Tạo xuất ăn
router.get("/distributions/my", getMyDistributions); // Xuất ăn của tôi
router.get("/distributions/stats", getMealStats); // Thống kê
router.get("/distributions/export", isModerator, exportMealDistributions); // Export Excel
router.get("/distributions/all", isModerator, getAllDistributions); // Tất cả xuất ăn
router.patch("/distributions/:id/confirm", isModerator, confirmDistribution); // Xác nhận
router.patch("/distributions/:id/serve", isModerator, serveDistribution); // Đã phát
router.patch("/distributions/:id/cancel", cancelDistribution); // Hủy
router.get("/distributions/:id", getDistributionById); // Chi tiết

export default router;
