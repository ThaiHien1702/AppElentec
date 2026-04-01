import express from "express";
import { verifyToken, isModerator } from "../middlewares/authMiddleware.js";
import {
  getRealtimeReport,
  getDailyReport,
  getOverdueReport,
  exportAccessReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Nhóm API báo cáo vận hành cổng cho moderator/admin.
router.get("/realtime", verifyToken, isModerator, getRealtimeReport);
router.get("/daily", verifyToken, isModerator, getDailyReport);
router.get("/overdue", verifyToken, isModerator, getOverdueReport);
router.get("/export", verifyToken, isModerator, exportAccessReport);

export default router;
