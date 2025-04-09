const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Route pour rafraîchir le token
router.post("/refresh-token", (req, res) => {
  const oldToken = req.headers.authorization?.split(" ")[1];
  if (!oldToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET || "jwtkey@123", {
      ignoreExpiration: true, // Ignorer l'expiration pour vérifier le payload
    });

    // Créer un nouveau token avec une nouvelle expiration
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET || "jwtkey@123",
      { expiresIn: "2h" } // Nouvelle durée de vie
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;