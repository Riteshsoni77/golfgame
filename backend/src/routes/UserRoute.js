import express from "express";

import isLoggedIn from "../middleware/Auth.js";
import { getProfile, login, register } from "../controllers/UserController.js";





const router = express.Router();

router.get("/profile", isLoggedIn, getProfile);
router.post("/register", register);
router.post("/login", login);

export default router;
