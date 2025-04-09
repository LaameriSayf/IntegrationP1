const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    console.log("Début middleware authMiddleware");
    const authHeader = req.header("Authorization");
    console.log("authHeader reçu:", authHeader);

    if (!authHeader) {
      console.log("Aucun en-tête Authorization");
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Vérifie que l'en-tête commence par "Bearer " et extrait le token
    const token = authHeader.replace("Bearer ", "").trim();
    console.log("Token extrait:", token);

    if (!token) {
      console.log("Format de token invalide après extraction");
      return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    try {
      console.log("Tentative de vérification du token avec JWT_SECRET:", process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token décodé avec succès:", decoded);
      req.user = decoded;

      // Vérifie si l'utilisateur a le rôle requis
      if (roles.length && !roles.includes(req.user.role)) {
        console.log("Rôle non autorisé:", req.user.role, "Rôles requis:", roles);
        return res.status(403).json({ message: "Access denied. Unauthorized role." });
      }

      console.log("Authentification réussie, passage à next()");
      next();
    } catch (error) {
      console.error("Erreur vérification token:", error.message);
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;