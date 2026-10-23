
import express from "express";
import {
  addGolfScore,
  getMyGolfScores,
  updateGolfScore,
  deleteGolfScore,
} from "../controllers/GolfScoreController.js";

import isLoggedIn from "../middleware/Auth.js";
import requireRole from "../middleware/Role.js";

const router = express.Router();

router.use(isLoggedIn, requireRole("subscriber"));

router.post("/", addGolfScore);
router.get("/", getMyGolfScores);
router.patch("/:id", updateGolfScore);
router.delete("/:id", deleteGolfScore);

export default router;
