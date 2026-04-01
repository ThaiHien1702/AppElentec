import express from "express";
import {
  getApprovalInbox,
  approveVisitRequest,
  rejectVisitRequest,
} from "../controllers/visitController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Luồng Approver: inbox chờ duyệt, duyệt hoặc từ chối có lý do.
router.get("/inbox", verifyToken, getApprovalInbox);
router.post("/:requestId/approve", verifyToken, approveVisitRequest);
router.post("/:requestId/reject", verifyToken, rejectVisitRequest);

export default router;
