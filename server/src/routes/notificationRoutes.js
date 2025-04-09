const express = require("express");
const router = express.Router();
const { checkPendingApprovals } = require("../controllers/notificationController");

router.get("/send-pending-approvals", async (req, res) => {
  await checkPendingApprovals();
  res.json({ message: "Rappel des demandes envoyées." });
});

module.exports = router;
