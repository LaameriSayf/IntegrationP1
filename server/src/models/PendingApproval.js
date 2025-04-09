const mongoose = require("mongoose");

const pendingApprovalSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  approvalType: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "notified"], default: "pending" }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PendingApproval", pendingApprovalSchema);

