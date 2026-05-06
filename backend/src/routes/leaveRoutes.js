import express from "express";
import multer from "multer";
import {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  getLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  updateLeaveRequest,
  getLeaveStats,
  exportLeaveToExcel,
  downloadLeaveTemplateExcel,
  importLeaveFromExcel,
} from "../controllers/leaveController.js";
import {
  verifyToken,
  isAdmin,
  isModerator,
} from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Tất cả routes đều cần xác thực
router.use(verifyToken);

// Routes cho user thường
router.post("/", createLeaveRequest); // Tạo yêu cầu nghỉ phép
router.get("/my", getMyLeaveRequests); // Lấy yêu cầu của mình
router.get("/stats", getLeaveStats); // Thống kê nghỉ phép

// Routes cho Excel
router.get("/excel/export", isModerator, exportLeaveToExcel); // Export dữ liệu ra Excel
router.get("/excel/template", downloadLeaveTemplateExcel); // Download template
router.post(
  "/excel/import",
  isModerator,
  upload.single("file"),
  importLeaveFromExcel,
); // Import từ Excel

// Routes cho admin/moderator (PHẢI đặt trước /:id để tránh bị /:id bắt trước)
router.get("/all", isModerator, getAllLeaveRequests); // Lấy tất cả yêu cầu
router.patch("/:id/approve", isModerator, approveLeaveRequest); // Phê duyệt
router.patch("/:id/reject", isModerator, rejectLeaveRequest); // Từ chối

// Routes có param (đặt sau cùng)
router.get("/:id", getLeaveRequestById); // Lấy chi tiết yêu cầu
router.put("/:id", updateLeaveRequest); // Cập nhật yêu cầu (chỉ của mình)
router.patch("/:id/cancel", cancelLeaveRequest); // Hủy yêu cầu (chỉ của mình)

export default router;
