import express from "express";
import { verifyToken, isModerator } from "../middlewares/authMiddleware.js";
import {
  getRealtimeReport,
  getDailyReport,
  getOverdueReport,
  exportAccessReport,
  getLeaveRealtimeReport,
  getLeaveDailyReport,
  getLeavePendingReport,
  exportLeaveReport,
  getOvertimeRealtimeReport,
  getOvertimeDailyReport,
  getOvertimePendingReport,
  exportOvertimeReport,
  getLuggageRealtimeReport,
  getLuggageDailyReport,
  getLuggageIssuesReport,
  exportLuggageReport,
  getMealRealtimeReport,
  getMealDailyReport,
  getMealPendingReport,
  exportMealReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Access report endpoints
router.get("/realtime", verifyToken, isModerator, getRealtimeReport);
router.get("/daily", verifyToken, isModerator, getDailyReport);
router.get("/overdue", verifyToken, isModerator, getOverdueReport);
router.get("/export", verifyToken, isModerator, exportAccessReport);

// Leave report endpoints
router.get("/leave/realtime", verifyToken, isModerator, getLeaveRealtimeReport);
router.get("/leave/daily", verifyToken, isModerator, getLeaveDailyReport);
router.get("/leave/pending", verifyToken, isModerator, getLeavePendingReport);
router.get("/leave/export", verifyToken, isModerator, exportLeaveReport);

// Overtime report endpoints
router.get(
  "/overtime/realtime",
  verifyToken,
  isModerator,
  getOvertimeRealtimeReport,
);
router.get("/overtime/daily", verifyToken, isModerator, getOvertimeDailyReport);
router.get(
  "/overtime/pending",
  verifyToken,
  isModerator,
  getOvertimePendingReport,
);
router.get("/overtime/export", verifyToken, isModerator, exportOvertimeReport);

// Luggage report endpoints
router.get(
  "/luggage/realtime",
  verifyToken,
  isModerator,
  getLuggageRealtimeReport,
);
router.get("/luggage/daily", verifyToken, isModerator, getLuggageDailyReport);
router.get("/luggage/issues", verifyToken, isModerator, getLuggageIssuesReport);
router.get("/luggage/export", verifyToken, isModerator, exportLuggageReport);

// Meal report endpoints
router.get("/meal/realtime", verifyToken, isModerator, getMealRealtimeReport);
router.get("/meal/daily", verifyToken, isModerator, getMealDailyReport);
router.get("/meal/pending", verifyToken, isModerator, getMealPendingReport);
router.get("/meal/export", verifyToken, isModerator, exportMealReport);

export default router;
