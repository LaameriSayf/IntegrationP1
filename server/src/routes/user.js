const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authorization");

// Récupérer les widgets de l'utilisateur
router.get("/widgets", authMiddleware(), async (req, res) => {
  try {
    console.log("Requête /widgets, userId:", req.user.id); // Changé en req.user.id
    const user = await User.findById(req.user.id); // Changé en req.user.id
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ widgets: user.widgets });
  } catch (error) {
    console.error("Erreur récupération widgets:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Mettre à jour les widgets de l'utilisateur
router.patch("/widgets", authMiddleware(), async (req, res) => {
  try {
    console.log("Requête PATCH /widgets, userId:", req.user.id, "widgets:", req.body.widgets); // Changé en req.user.id
    const { widgets } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, // Changé en req.user.id
      { widgets },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ widgets: user.widgets });
  } catch (error) {
    console.error("Erreur mise à jour widgets:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;