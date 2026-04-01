import express from "express";
import {
  verifyVisitQr,
  gateCheckIn,
  gateCheckOut,
  gateManualDeny,
  getGateCards,
  registerGateCard,
  toggleGateCardStatus,
} from "../controllers/visitController.js";
import { verifyToken, isModerator } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Luồng Security tại cổng: verify, check-in/out và ghi nhận từ chối thủ công.
router.post("/verify-qr", verifyToken, isModerator, verifyVisitQr);
router.post("/check-in", verifyToken, isModerator, gateCheckIn);
router.post("/check-out", verifyToken, isModerator, gateCheckOut);
router.post("/manual-deny", verifyToken, isModerator, gateManualDeny);
router.get("/cards", verifyToken, isModerator, getGateCards);
router.post("/cards", verifyToken, isModerator, registerGateCard);
router.patch("/cards/toggle", verifyToken, isModerator, toggleGateCardStatus);

export default router;
