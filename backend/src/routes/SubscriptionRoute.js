
import express from "express";
import {
    createSubscription,
    getMySubscription,
    cancelSubscription,
} from "../controllers/SubscriptionController.js";

import Auth from "../middleware/Auth.js";

const router = express.Router();

router.post("/", Auth, createSubscription);
router.get("/", Auth, getMySubscription);
router.patch("/cancel", Auth, cancelSubscription);

export default router;
