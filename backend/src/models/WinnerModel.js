
import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchCount: {
      type: Number,
      enum: [3, 4, 5],
      required: true,
    },
    matchedNumbers: [Number],
    prizeAmount: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Winner", winnerSchema);
