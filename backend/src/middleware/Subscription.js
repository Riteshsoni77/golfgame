
import Subscription from "../models/SubscriptionModel.js";

const requireSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.userId,
      status: "active",
    }).sort({ createdAt: -1 });

    const isActive =
      subscription?.renewalDate &&
      new Date(subscription.renewalDate) > new Date();

    if (!isActive) {
      return res.status(403).json({
        success: false,
        message: "An active subscription is required",
        code: "SUBSCRIPTION_REQUIRED",
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error("Subscription middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify subscription",
    });
  }
};

export default requireSubscription;
