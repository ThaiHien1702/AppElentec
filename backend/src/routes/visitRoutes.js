import express from "express";
import {
  createVisitRequest,
  getMyVisitRequests,
  cancelVisitRequest,
} from "../controllers/visitController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Luồng Requester: tạo yêu cầu, xem danh sách và hủy yêu cầu.
router.get("/", verifyToken, getMyVisitRequests);
router.post("/", verifyToken, createVisitRequest);
router.post("/:id/cancel", verifyToken, cancelVisitRequest);

export default router;
