import express from "express";
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
} from "../controllers/leaveController.js";
import {
  verifyToken,
  isAdmin,
  isModerator,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều cần xác thực
router.use(verifyToken);

// Routes cho user thường
router.post("/", createLeaveRequest); // Tạo yêu cầu nghỉ phép
router.get("/my", getMyLeaveRequests); // Lấy yêu cầu của mình
router.get("/stats", getLeaveStats); // Thống kê nghỉ phép
router.get("/:id", getLeaveRequestById); // Lấy chi tiết yêu cầu
router.put("/:id", updateLeaveRequest); // Cập nhật yêu cầu (chỉ của mình)
router.patch("/:id/cancel", cancelLeaveRequest); // Hủy yêu cầu (chỉ của mình)

// Routes cho admin/moderator
router.get("/", isModerator, getAllLeaveRequests); // Lấy tất cả yêu cầu
router.patch("/:id/approve", isModerator, approveLeaveRequest); // Phê duyệt
router.patch("/:id/reject", isModerator, rejectLeaveRequest); // Từ chối

export default router;
