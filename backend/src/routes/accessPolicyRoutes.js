import express from "express";
import {
  listAccessPolicies,
  upsertAccessPolicy,
  toggleAccessPolicy,
} from "../controllers/accessPolicyController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Quản trị blacklist/whitelist - chỉ admin.
router.get("/policies", verifyToken, isAdmin, listAccessPolicies);
router.post("/policies", verifyToken, isAdmin, upsertAccessPolicy);
router.patch("/policies/:id/toggle", verifyToken, isAdmin, toggleAccessPolicy);

export default router;
