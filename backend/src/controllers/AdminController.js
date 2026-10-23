
import User from "../models/UserModel.js";
import Subscription from "../models/SubscriptionModel.js";
import Winner from "../models/WinnerModel.js";
import Charity from "../models/CharityModel.js";
import Draw from "../models/DrawModel.js";

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      winners,
      charities,
      draws,
    ] = await Promise.all([
      User.countDocuments({ role: "subscriber" }),
      Subscription.countDocuments({ status: "active" }),
      Winner.find().select("prizeAmount"),
      Charity.countDocuments({ status: "active" }),
      Draw.find().select("prizePool status"),
    ]);

    const totalPrizePool = draws.reduce(
      (total, draw) => total + (draw.prizePool || 0),
      0
    );

    const totalWon = winners.reduce(
      (total, winner) => total + (winner.prizeAmount || 0),
      0
    );

    res.status(200).json({
      totalUsers,
      activeSubscriptions,
      activeCharities: charities,
      totalDraws: draws.length,
      totalPrizePool,
      totalWon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
