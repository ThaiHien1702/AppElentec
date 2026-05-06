import express from "express";
import { getDepartmentStats, getDepartmentDetail } from "../controllers/dashboardController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/stats", getDepartmentStats);
router.get("/detail/:type", getDepartmentDetail);

export default router;
