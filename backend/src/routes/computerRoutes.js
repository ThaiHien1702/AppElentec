import express from "express";
import {
  getAllComputers,
  getComputerById,
  createComputer,
  updateComputer,
  deleteComputer,
  getComputersStatsByDept,
  searchComputers,
  exportComputersToExcel,
  importComputersFromExcel,
  downloadComputersTemplateExcel,
} from "../controllers/computerController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const isAdminOrIT = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role department");

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    const isAdmin = user.role === "admin";
    const isITDepartment =
      typeof user.department === "string" &&
      user.department.toLowerCase().includes("it");

    if (!isAdmin && !isITDepartment) {
      return res
        .status(403)
        .json({ message: "Chỉ Admin hoặc bộ phận IT mới có quyền thao tác" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi kiểm tra quyền truy cập" });
  }
};

// All routes require authentication
router.use(verifyToken);

// Get all computers with filters
router.get("/", getAllComputers);

// Get computers statistics
router.get("/stats/by-dept", getComputersStatsByDept);

// Search computers
router.get("/search", searchComputers);

// Export computers to excel
router.get("/export", exportComputersToExcel);

// Download import template excel
router.get("/template", downloadComputersTemplateExcel);

// Import computers from excel (IT/Admin only)
router.post(
  "/import",
  isAdminOrIT,
  upload.single("file"),
  importComputersFromExcel,
);

// Get computer by ID
router.get("/:id", getComputerById);

// Create new computer (IT/Admin only)
router.post("/", isAdminOrIT, createComputer);

// Update computer (IT/Admin only)
router.put("/:id", isAdminOrIT, updateComputer);

// Delete computer (IT/Admin only)
router.delete("/:id", isAdminOrIT, deleteComputer);

export default router;
