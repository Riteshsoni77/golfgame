
import express from "express";
import {
  createDraw,
  simulateDraw,
  publishDraw,
  getPublishedDraws,
} from "../controllers/DrawController.js";

import isLoggedIn from "../middleware/Auth.js";
import requireRole from "../middleware/Role.js";

const router = express.Router();

// Subscribers can view published results
router.get("/", isLoggedIn, getPublishedDraws);

// Admin-only operations
router.post(
  "/",
  isLoggedIn,
  requireRole("administrator"),
  createDraw
);

router.post(
  "/:id/simulate",
  isLoggedIn,
  requireRole("administrator"),
  simulateDraw
);

router.post(
  "/:id/publish",
  isLoggedIn,
  requireRole("administrator"),
  publishDraw
);

export default router;
