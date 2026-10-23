import mongoose from "mongoose";

const golfScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

golfScoreSchema.index({ user: 1, date: 1 }, { unique: true });

const GolfScore = mongoose.model("GolfScore", golfScoreSchema);

export default GolfScore;