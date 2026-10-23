
import mongoose from "mongoose";
import Winner from "../models/WinnerModel.js";

// Subscriber: View my winnings
export const getMyWinnings = async (req, res) => {
  try {
    const winners = await Winner.find({
      user: req.userId,
    })
      .populate("draw", "month year winningNumbers status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: winners.length,
      winners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: View all winners
export const getAllWinners = async (req, res) => {
  try {
    const winners = await Winner.find()
      .populate("user", "name email")
      .populate("draw", "month year winningNumbers")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: winners.length,
      winners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Verify or reject a winner
export const verifyWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid winner ID" });
    }

    if (!["approved", "rejected"].includes(verificationStatus)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const winner = await Winner.findById(id);

    if (!winner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    winner.verificationStatus = verificationStatus;
    await winner.save();

    res.status(200).json({
      message: `Winner ${verificationStatus}`,
      winner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Mark prize as paid
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid winner ID" });
    }

    if (paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Payment status can only be changed to paid",
      });
    }

    const winner = await Winner.findById(id);

    if (!winner) {
      return res.status(404).json({ message: "Winner not found" });
    }

    if (winner.verificationStatus !== "approved") {
      return res.status(400).json({
        message: "Verify the winner before marking the prize as paid",
      });
    }

    winner.paymentStatus = "paid";
    await winner.save();

    res.status(200).json({
      message: "Payment marked as paid",
      winner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
