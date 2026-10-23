
import mongoose from "mongoose";

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    drawType: {
      type: String,
      enum: ["random", "algorithmic"],
      default: "random",
    },
    winningNumbers: {
      type: [Number],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "simulated", "published", "completed"],
      default: "draft",
    },
    activeSubscriberCount: {
      type: Number,
      default: 0,
    },
    prizePool: {
      type: Number,
      default: 0,
    },
    carriedJackpot: {
      type: Number,
      default: 0,
    },
    prizes: {
      threeMatch: { type: Number, default: 0 },
      fourMatch: { type: Number, default: 0 },
      fiveMatch: { type: Number, default: 0 },
    },
    rolloverAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

drawSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.model("Draw", drawSchema);
