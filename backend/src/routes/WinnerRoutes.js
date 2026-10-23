
import express from "express";

import {
  getMyWinnings,
  getAllWinners,
  verifyWinner,
  updatePaymentStatus,
} from "../controllers/WinnerController.js";

import isLoggedIn from "../middleware/Auth.js";
import requireRole from "../middleware/Role.js";

const router = express.Router();

// Subscriber: View personal winnings
router.get("/me", isLoggedIn, requireRole("subscriber"), getMyWinnings);

// Admin: View and manage winners
router.get("/", isLoggedIn, requireRole("administrator"), getAllWinners);

router.patch(
  "/:id/verify",
  isLoggedIn,
  requireRole("administrator"),
  verifyWinner
);

router.patch(
  "/:id/payment",
  isLoggedIn,
  requireRole("administrator"),
  updatePaymentStatus
);

export default router;
