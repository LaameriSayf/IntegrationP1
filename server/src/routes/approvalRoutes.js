const express = require("express");
const router = express.Router();
const { createApproval, fetchApprovals, approveRequest } = require("../controllers/approvalController");

router.post("/create", createApproval); // Créer une nouvelle demande
router.get("/approvals", fetchApprovals); // Récupérer toutes les approbations
router.put("/approve/:id", approveRequest); // Approuver une demande par ID

module.exports = router;
