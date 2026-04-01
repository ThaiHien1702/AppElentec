import express from "express";
import {
  getAllUsers,
  getUserById,
  searchUsers,
  getUsersByPosition,
  getUsersByDepartment,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes - Mọi user đã login đều xem được
router.get("/", verifyToken, getAllUsers);
router.get("/search", verifyToken, searchUsers);
router.get("/position", verifyToken, getUsersByPosition);
router.get("/department", verifyToken, getUsersByDepartment);
router.get("/:id", verifyToken, getUserById);

export default router;
