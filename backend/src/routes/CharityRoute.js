
import express from "express";

import {
  createCharity,
  getAllCharities,
  getCharityById,
  updateCharity,
  getMyCharityImpact,
  selectCharity,
} from "../controllers/CharityController.js";
import isLoggedIn from "../middleware/Auth.js";
import requireRole from "../middleware/Role.js";



const router = express.Router();

// Subscriber contribution route — keep before /:id
router.get("/impact/me", isLoggedIn, requireRole("subscriber"), getMyCharityImpact);

// Charity directory
router.get("/", getAllCharities);
router.get("/:id", getCharityById);
router.patch(
  "/select",
  isLoggedIn,
  requireRole("subscriber"),
  selectCharity
);

// Administrator routes
router.post("/", isLoggedIn, requireRole("administrator"), createCharity);
router.patch("/:id", isLoggedIn, requireRole("administrator"), updateCharity);



export default router;
