import mongoose from "mongoose";
import Charity from "../models/CharityModel.js";
import User from "../models/UserModel.js";


import Subscription from "../models/SubscriptionModel.js";

// Admin: Create charity
export const createCharity = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required",
      });
    }

    const charity = await Charity.create({
      name,
      description,
      image,
    });

    return res.status(201).json({
      message: "Charity created successfully",
      charity,
    });
  } catch (error) {
    console.error("Create charity error:", error);
    return res.status(500).json({
      message: "Failed to create charity",
    });
  }
};

// Public: Get all active charities with optional search
export const getAllCharities = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = { status: "active" };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const charities = await Charity.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: charities.length,
      charities,
    });
  } catch (error) {
    console.error("Get charities error:", error);
    return res.status(500).json({
      message: "Failed to retrieve charities",
    });
  }
};

// Public: Get one charity
export const getCharityById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid charity ID" });
    }

    const charity = await Charity.findOne({
      _id: req.params.id,
      status: "active",
    });

    if (!charity) {
      return res.status(404).json({
        message: "Charity not found",
      });
    }

    return res.status(200).json({ charity });
  } catch (error) {
    console.error("Get charity error:", error);
    return res.status(500).json({
      message: "Failed to retrieve charity",
    });
  }
};

// Admin: Update charity
export const updateCharity = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid charity status",
      });
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (status !== undefined) updates.status = status;

    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!charity) {
      return res.status(404).json({
        message: "Charity not found",
      });
    }

    return res.status(200).json({
      message: "Charity updated successfully",
      charity,
    });
  } catch (error) {
    console.error("Update charity error:", error);
    return res.status(500).json({
      message: "Failed to update charity",
    });
  }
};

// Subscriber: View their charity contribution estimate
export const getMyCharityImpact = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("selectedCharity", "name description image");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const subscription = await Subscription.findOne({
      user: req.userId,
    }).sort({ createdAt: -1 });

    if (!user.selectedCharity) {
      return res.status(200).json({
        message: "Please select a charity",
        charity: null,
        charityPercentage: user.charityPercentage,
        estimatedContribution: 0,
      });
    }

    const estimatedContribution = subscription
      ? Number(
          (
            subscription.amount *
            (user.charityPercentage / 100)
          ).toFixed(2)
        )
      : 0;

    return res.status(200).json({
      charity: user.selectedCharity,
      plan: subscription?.plan || null,
      subscriptionAmount: subscription?.amount || 0,
      charityPercentage: user.charityPercentage,
      estimatedContribution,
      currency: "INR",
    });
  } catch (error) {
    console.error("Charity impact error:", error);
    return res.status(500).json({
      message: "Failed to retrieve charity impact",
    });
  }
};




export const selectCharity = async (req, res) => {
  try {
    const { charityId, charityPercentage = 10 } = req.body;

    if (!charityId || !mongoose.isValidObjectId(charityId)) {
      return res.status(400).json({
        message: "Please select a valid charity",
      });
    }

    if (
      !Number.isFinite(charityPercentage) ||
      charityPercentage < 10 ||
      charityPercentage > 100
    ) {
      return res.status(400).json({
        message: "Charity contribution must be between 10% and 100%",
      });
    }

    const charity = await Charity.findOne({
      _id: charityId,
      status: "active",
    });

    if (!charity) {
      return res.status(404).json({
        message: "Active charity not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        selectedCharity: charityId,
        charityPercentage,
      },
      { new: true }
    ).populate("selectedCharity", "name description image");

    return res.status(200).json({
      message: "Charity selected successfully",
      user,
    });
  
    } catch (error) {
  console.error("Select charity error:", error.message);
  console.error(error.stack);

  return res.status(500).json({
    message: "Failed to select charity",
    error: error.message,
  });

  }
};

