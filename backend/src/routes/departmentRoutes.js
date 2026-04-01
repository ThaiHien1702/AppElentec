import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  getDepartmentUsers,
  addUserToDepartment,
  removeUserFromDepartment,
} from "../controllers/departmentController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin only routes - Chỉ admin được xem/quản lý departments

// Specific routes FIRST (routes cụ thể phải đứng trước)
router.get("/", verifyToken, isAdmin, getAllDepartments);
router.post("/", verifyToken, isAdmin, createDepartment);

// User management routes - Admin only (cụ thể hơn)
router.post("/:id/users/add", verifyToken, isAdmin, addUserToDepartment);
router.post(
  "/:id/users/remove",
  verifyToken,
  isAdmin,
  removeUserFromDepartment,
);
router.get("/:id/users", verifyToken, isAdmin, getDepartmentUsers);

// General routes with :id (generic, đặt cuối cùng)
router.get("/:id", verifyToken, isAdmin, getDepartmentById);
router.put("/:id", verifyToken, isAdmin, updateDepartment);
router.delete("/:id", verifyToken, isAdmin, deleteDepartment);
router.patch(
  "/:id/toggle-status",
  verifyToken,
  isAdmin,
  toggleDepartmentStatus,
);

export default router;
