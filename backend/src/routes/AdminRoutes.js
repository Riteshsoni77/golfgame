
import express from "express";
import {
  getAdminStats,
} from "../controllers/AdminController.js";

import isLoggedIn from "../middleware/Auth.js";
import requireRole from "../middleware/Role.js";

const router = express.Router();

router.use(isLoggedIn, requireRole("administrator"));

router.get("/stats", getAdminStats);

export default router;
