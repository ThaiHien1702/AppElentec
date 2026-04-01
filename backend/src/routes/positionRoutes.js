import express from "express";
import {
  verifyToken,
  isAdmin,
  isManager,
} from "../middlewares/authMiddleware.js";
import {
  getPositionHierarchy,
  getUsersByPosition,
  updateUserPosition,
  getUserPositionInfo,
  getSubordinates,
  bulkUpdatePositions,
  getPositionStatistics,
} from "../controllers/positionController.js";

const router = express.Router();

// GET position hierarchy (public, but better to keep it authenticated)
router.get("/hierarchy", verifyToken, getPositionHierarchy);

// GET users by position
router.get("/users", verifyToken, getUsersByPosition);

// GET current user's position info
router.get("/my-info", verifyToken, getUserPositionInfo);

// GET subordinates of a position
router.get("/subordinates", verifyToken, getSubordinates);

// GET position statistics (admin only)
router.get("/statistics", verifyToken, isAdmin, getPositionStatistics);

// PUT update user position (manager or admin only)
router.put("/:userId", verifyToken, isManager, updateUserPosition);

// POST bulk update positions (admin only)
router.post("/bulk-update", verifyToken, isAdmin, bulkUpdatePositions);

export default router;
