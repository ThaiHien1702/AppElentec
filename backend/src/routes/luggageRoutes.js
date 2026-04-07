import express from "express";
import {
  addLuggage,
  getLuggageByVisit,
  checkOutLuggage,
  updateLuggageStatus,
  deleteLuggage,
  getAllLuggage,
  getLuggageStats,
} from "../controllers/luggageController.js";
import { verifyToken, isModerator } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả routes yêu cầu xác thực và quyền moderator/admin
router.use(verifyToken, isModerator);

// POST - Thêm hành lý mới
router.post("/", addLuggage);

// GET - Thống kê hành lý (PHẢI ĐỨng trước GET /)
router.get("/stats/summary", getLuggageStats);

// GET - Lấy danh sách hành lý theo yêu cầu ra/vào
router.get("/visit/:visitRequestId", getLuggageByVisit);

// GET - Lấy tất cả hành lý (có bộ lọc)
router.get("/", getAllLuggage);

// PATCH - Check-out hành lý
router.patch("/:luggageId/checkout", checkOutLuggage);

// PATCH - Cập nhật trạng thái hành lý
router.patch("/:luggageId/status", updateLuggageStatus);

// DELETE - Xóa hành lý
router.delete("/:luggageId", deleteLuggage);

export default router;
