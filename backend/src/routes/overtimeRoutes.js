import express from "express";
import multer from "multer";
import {
  createOvertimeRequest,
  getMyOvertimeRequests,
  getAllOvertimeRequests,
  getOvertimeById,
  approveOvertimeRequest,
  rejectOvertimeRequest,
  cancelOvertimeRequest,
  updateOvertimeRequest,
  updateOvertimeResult,
  getOvertimeStats,
  exportOvertimeToExcel,
  downloadOvertimeTemplateExcel,
  importOvertimeFromExcel,
} from "../controllers/overtimeController.js";
import { verifyToken, isModerator } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Tất cả routes đều cần xác thực
router.use(verifyToken);

// Routes cho user thường
router.post("/", createOvertimeRequest); // Đăng ký OT
router.get("/my", getMyOvertimeRequests); // Lấy OT của mình
router.get("/stats", getOvertimeStats); // Thống kê OT

// Routes cho Excel
router.get("/excel/export", isModerator, exportOvertimeToExcel); // Export dữ liệu ra Excel
router.get("/excel/template", downloadOvertimeTemplateExcel); // Download template
router.post(
  "/excel/import",
  isModerator,
  upload.single("file"),
  importOvertimeFromExcel,
); // Import từ Excel

// Routes cho admin/moderator (đặt trước /:id)
router.get("/all", isModerator, getAllOvertimeRequests); // Lấy tất cả OT
router.patch("/:id/approve", isModerator, approveOvertimeRequest); // Phê duyệt
router.patch("/:id/reject", isModerator, rejectOvertimeRequest); // Từ chối
router.patch("/:id/result", isModerator, updateOvertimeResult); // Cập nhật kết quả

// Routes có param (đặt sau cùng)
router.get("/:id", getOvertimeById); // Lấy chi tiết
router.put("/:id", updateOvertimeRequest); // Cập nhật (chỉ của mình)
router.patch("/:id/cancel", cancelOvertimeRequest); // Hủy (chỉ của mình)

export default router;
