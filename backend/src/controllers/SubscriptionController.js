
import Subscription from "../models/SubscriptionModel.js";

const PLAN_PRICES = {
    monthly: 499,
    yearly: 4999,
};

// Create subscription
export const createSubscription = async (req, res) => {
    try {
        const { plan } = req.body;

        if (!["monthly", "yearly"].includes(plan)) {
            return res.status(400).json({
                message: "Please select a valid subscription plan",
            });
        }

        const existingSubscription = await Subscription.findOne({
            user: req.userId,
            status: "active",
        });

        if (existingSubscription) {
            return res.status(409).json({
                message: "You already have an active subscription",
            });
        }

        const startDate = new Date();
        const renewalDate = new Date(startDate);

        if (plan === "monthly") {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        } else {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }

        const subscription = await Subscription.create({
            user: req.userId,
            plan,
            amount: PLAN_PRICES[plan],
            status: "active",
            startDate,
            renewalDate,
        });

        return res.status(201).json({
            message: "Subscription created successfully",
            subscription,
        });
    } catch (error) {
        console.error("Create subscription error:", error);

        return res.status(500).json({
            message: "Failed to create subscription",
        });
    }
};


// Get logged-in user's subscription
export const getMySubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.userId,
        }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.status(404).json({
                message: "No subscription found",
            });
        }

        return res.status(200).json({
            subscription,
        });
    } catch (error) {
        console.error("Get subscription error:", error);

        return res.status(500).json({
            message: "Failed to retrieve subscription",
        });
    }
};


// Cancel subscription
export const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            user: req.userId,
            status: "active",
        });

        if (!subscription) {
            return res.status(404).json({
                message: "No active subscription found",
            });
        }

        subscription.status = "inactive";
        await subscription.save();

        return res.status(200).json({
            message: "Subscription cancelled successfully",
            subscription,
        });
    } catch (error) {
        console.error("Cancel subscription error:", error);

        return res.status(500).json({
            message: "Failed to cancel subscription",
        });
    }
};
