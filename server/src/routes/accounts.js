const express = require("express");
const router = express.Router();
const CompteBancaire = require("../models/compteBancaire");
const authMiddleware = require("../middlewares/authorization");

router.get("/total-balance", authMiddleware(), async (req, res) => {
  console.log("Received request for /total-balance, fetching all accounts");
  try {
    const accounts = await CompteBancaire.find();
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    console.log("Accounts found:", accounts);
    res.json({ totalBalance });
  } catch (error) {
    console.error("Error calculating total balance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/last-account", authMiddleware(), async (req, res) => {
  console.log("Received request for /last-account, fetching last account");
  try {
    const lastAccount = await CompteBancaire.findOne()
      .sort({ updatedAt: -1 })
      .select("numeroCompte balance updatedAt");
    console.log("Last account found:", lastAccount);
    res.json(lastAccount || {});
  } catch (error) {
    console.error("Error fetching last account:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;