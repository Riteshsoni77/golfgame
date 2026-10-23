
import mongoose from "mongoose";
import GolfScore from "../models/GolfScoreModel.js";

// Add a golf score
export const addGolfScore = async (req, res) => {
  try {
    const { score, date } = req.body;

    if (score === undefined || !Number.isInteger(Number(score)) ||
        Number(score) < 1 || Number(score) > 45) {
      return res.status(400).json({
        message: "Score must be an integer between 1 and 45",
      });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        message: "A valid score date is required",
      });
    }

    // Normalize to the start of the calendar day (UTC)
    const scoreDate = new Date(date);
    scoreDate.setUTCHours(0, 0, 0, 0);

    const existingScore = await GolfScore.findOne({
      user: req.userId,
      date: scoreDate,
    });

    if (existingScore) {
      return res.status(409).json({
        message: "A score already exists for this date. Edit the existing score instead.",
      });
    }

    await GolfScore.create({
      user: req.userId,
      score: Number(score),
      date: scoreDate,
    });

    // Keep only the latest five scores
    const scores = await GolfScore.find({
      user: req.userId,
    }).sort({ date: -1, createdAt: -1 });

    if (scores.length > 5) {
      const oldScores = scores.slice(5).map((item) => item._id);

      await GolfScore.deleteMany({
        _id: { $in: oldScores },
        user: req.userId,
      });
    }

    const latestScores = await GolfScore.find({
      user: req.userId,
    }).sort({ date: -1, createdAt: -1 });

    return res.status(201).json({
      message: "Golf score added successfully",
      count: latestScores.length,
      scores: latestScores,
    });
  } catch (error) {
    console.error("Add golf score error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A score already exists for this date",
      });
    }

    return res.status(500).json({
      message: "Failed to add golf score",
    });
  }
};

// Get the subscriber's latest five scores
export const getMyGolfScores = async (req, res) => {
  try {
    const scores = await GolfScore.find({
      user: req.userId,
    }).sort({ date: -1, createdAt: -1 }).limit(5);

    return res.status(200).json({
      count: scores.length,
      scores,
    });
  } catch (error) {
    console.error("Get golf scores error:", error);

    return res.status(500).json({
      message: "Failed to retrieve golf scores",
    });
  }
};

// Edit an existing score
export const updateGolfScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, date } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid golf score ID",
      });
    }

    if (score === undefined || !Number.isInteger(Number(score)) ||
        Number(score) < 1 || Number(score) > 45) {
      return res.status(400).json({
        message: "Score must be an integer between 1 and 45",
      });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        message: "A valid score date is required",
      });
    }

    const scoreDate = new Date(date);
    scoreDate.setUTCHours(0, 0, 0, 0);

    const existing = await GolfScore.findOne({
      _id: id,
      user: req.userId,
    });

    if (!existing) {
      return res.status(404).json({
        message: "Golf score not found",
      });
    }

    const duplicate = await GolfScore.findOne({
      user: req.userId,
      date: scoreDate,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "A score already exists for this date",
      });
    }

    existing.score = Number(score);
    existing.date = scoreDate;
    await existing.save();

    const scores = await GolfScore.find({
      user: req.userId,
    }).sort({ date: -1, createdAt: -1 }).limit(5);

    return res.status(200).json({
      message: "Golf score updated successfully",
      scores,
    });
  } catch (error) {
    console.error("Update golf score error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A score already exists for this date",
      });
    }

    return res.status(500).json({
      message: "Failed to update golf score",
    });
  }
};

// Delete a score
export const deleteGolfScore = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid golf score ID",
      });
    }

    const score = await GolfScore.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!score) {
      return res.status(404).json({
        message: "Golf score not found",
      });
    }

    return res.status(200).json({
      message: "Golf score deleted successfully",
    });
  } catch (error) {
    console.error("Delete golf score error:", error);

    return res.status(500).json({
      message: "Failed to delete golf score",
    });
  }
};
