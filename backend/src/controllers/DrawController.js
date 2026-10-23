
import Draw from "../models/DrawModel.js";
import Winner from "../models/WinnerModel.js";
import User from "../models/UserModel.js";
import Subscription from "../models/SubscriptionModel.js";
import GolfScore from "../models/GolfScoreModel.js";

// Set the actual contribution rate supplied by your assignment/company.
const PRIZE_POOL_RATE = Number(process.env.PRIZE_POOL_RATE);

const generateRandomNumbers = () => {
  const numbers = [];

  while (numbers.length < 5) {
    const number = Math.floor(Math.random() * 45) + 1;

    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  return numbers.sort((a, b) => a - b);
};

// Simple weighted selection using how frequently each score occurs.
const generateWeightedNumbers = async () => {
  const scores = await GolfScore.find().select("score");

  const frequencies = {};

  scores.forEach(({ score }) => {
    frequencies[score] = (frequencies[score] || 0) + 1;
  });

  const numbers = [];

  while (numbers.length < 5) {
    const available = Array.from({ length: 45 }, (_, i) => i + 1)
      .filter((number) => !numbers.includes(number));

    const weights = available.map(
      (number) => frequencies[number] || 1
    );

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < available.length; i++) {
      random -= weights[i];

      if (random <= 0) {
        numbers.push(available[i]);
        break;
      }
    }
  }

  return numbers.sort((a, b) => a - b);
};

const calculatePrizePool = async () => {
  if (!Number.isFinite(PRIZE_POOL_RATE) ||
      PRIZE_POOL_RATE <= 0 ||
      PRIZE_POOL_RATE > 1) {
    throw new Error("Configure PRIZE_POOL_RATE between 0 and 1");
  }

  const subscriptions = await Subscription.find({
    status: "active",
  }).select("amount user");

  const totalContributions = subscriptions.reduce(
    (total, subscription) =>
      total + Number(subscription.amount || 0) * PRIZE_POOL_RATE,
    0
  );

  return {
    activeSubscriberCount: subscriptions.length,
    prizePool: Number(totalContributions.toFixed(2)),
  };
};

// Admin: Create a monthly draw
export const createDraw = async (req, res) => {
  try {
    const { month, year, drawType = "random" } = req.body;

    if (
      !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(year) || year < 2026 ||
      !["random", "algorithmic"].includes(drawType)
    ) {
      return res.status(400).json({
        message: "Provide a valid month, year and draw type",
      });
    }

    const draw = await Draw.create({ month, year, drawType });

    res.status(201).json({ message: "Draw created", draw });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: Simulate without publishing
export const simulateDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({ message: "Draw not found" });
    }

    if (draw.status === "published" || draw.status === "completed") {
      return res.status(400).json({
        message: "Published draws cannot be simulated again",
      });
    }

    const pool = await calculatePrizePool();

    const carriedJackpot = await Draw.findOne({
      status: "completed",
      rolloverAmount: { $gt: 0 },
    }).sort({ year: -1, month: -1 });

    const jackpot = carriedJackpot?.rolloverAmount || 0;
    const numbers =
      draw.drawType === "algorithmic"
        ? await generateWeightedNumbers()
        : generateRandomNumbers();

    const totalPool = pool.prizePool + jackpot;

    draw.winningNumbers = numbers;
    draw.activeSubscriberCount = pool.activeSubscriberCount;
    draw.prizePool = Number(totalPool.toFixed(2));
    draw.carriedJackpot = jackpot;

    draw.prizes.threeMatch = Number((totalPool * 0.25).toFixed(2));
    draw.prizes.fourMatch = Number((totalPool * 0.35).toFixed(2));
    draw.prizes.fiveMatch = Number((totalPool * 0.40).toFixed(2));

    draw.status = "simulated";
    await draw.save();

    res.json({ message: "Simulation complete", draw });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Publish and calculate winners
export const publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({ message: "Draw not found" });
    }

    if (draw.status !== "simulated") {
      return res.status(400).json({
        message: "Simulate the draw before publishing",
      });
    }

    // Use the five latest golf scores as each subscriber's entry.
    const subscribers = await User.find({
      role: "subscriber",
      subscriptionStatus: "active",
    }).select("_id");

    const tierWinners = { 3: [], 4: [], 5: [] };

    for (const subscriber of subscribers) {
      const scores = await GolfScore.find({ user: subscriber._id })
        .sort({ date: -1 })
        .limit(5)
        .select("score");

      const userNumbers = [...new Set(scores.map((item) => item.score))];
      const matchedNumbers = userNumbers.filter((number) =>
        draw.winningNumbers.includes(number)
      );

      if (matchedNumbers.length >= 3) {
        tierWinners[matchedNumbers.length].push({
          user: subscriber._id,
          matchedNumbers,
        });
      }
    }

    const tiers = [
      { count: 5, amount: draw.prizes.fiveMatch },
      { count: 4, amount: draw.prizes.fourMatch },
      { count: 3, amount: draw.prizes.threeMatch },
    ];

    let rolloverAmount = 0;

    for (const tier of tiers) {
      const winners = tierWinners[tier.count];

      if (tier.count === 5 && winners.length === 0) {
        rolloverAmount = tier.amount;
        continue;
      }

      if (winners.length === 0) continue;

      const prizePerWinner = Number(
        (tier.amount / winners.length).toFixed(2)
      );

      for (const winner of winners) {
        await Winner.create({
          draw: draw._id,
          user: winner.user,
          matchCount: tier.count,
          matchedNumbers: winner.matchedNumbers,
          prizeAmount: prizePerWinner,
        });
      }
    }

    draw.rolloverAmount = rolloverAmount;
    draw.status = "published";
    await draw.save();

    res.json({
      message: "Draw published",
      winningNumbers: draw.winningNumbers,
      rolloverAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subscriber: View published draws
export const getPublishedDraws = async (req, res) => {
  try {
    const draws = await Draw.find({
      status: { $in: ["published", "completed"] },
    }).sort({ year: -1, month: -1 });

    res.json({ count: draws.length, draws });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
