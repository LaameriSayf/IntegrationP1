const express = require("express");
const router = express.Router();
const Transaction = require("../models/FinancialTransaction");
const authMiddleware = require("../middlewares/authorization");

router.get("/recent", authMiddleware(), async (req, res) => {
  console.log("Received request for /api/transactions/recent, fetching 5 latest transactions");
  try {
    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5)
      .select("description amount type date _id");
    console.log("Recent transactions found:", transactions);
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Ajoutez les autres routes si elles manquent
router.get("/debit-credit", authMiddleware(), async (req, res) => {
  console.log("Received request for /api/transactions/debit-credit");
  try {
    const result = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);
    const debit = result.find((item) => item._id === "debit")?.total || 0;
    const credit = result.find((item) => item._id === "credit")?.total || 0;
    console.log("Debit/Credit totals:", { debit, credit });
    res.json({ debit: Math.abs(debit), credit });
  } catch (error) {
    console.error("Error fetching debit/credit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/anomalies", authMiddleware(), async (req, res) => {
  console.log("Received request for /api/transactions/anomalies");
  try {
    const anomalies = await Transaction.countDocuments({ amount: { $gt: 1000 } });
    console.log("Anomalies count:", anomalies);
    res.json({ anomaliesCount: anomalies });
  } catch (error) {
    console.error("Error fetching anomalies:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;