const express = require('express');
const { registerUser, signInUser, verifyEmail, resendVerificationEmail, fetchUsersByFilters, logout, checkAuth } = require('../controllers/userController');
const upload = require('../middlewares/uploadImage');
const router = express.Router();
const { User } = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
});

router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Token reçu:", token);
    if (!token) return res.status(401).json({ message: 'Aucun token fourni' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        console.log("Token décodé:", decoded);
        req.user = { id: decoded.userId, role: decoded.role }; 
        next();
    } catch (error) {
        console.error("Erreur de vérification du token:", error);
        res.status(401).json({ message: 'Token invalide' });
    }
};

const checkActive = async (req, res, next) => {
    try {
        console.log("Vérification checkActive pour user ID:", req.user.id);
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log("Utilisateur non trouvé dans checkActive:", req.user.id);
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        next();
    } catch (error) {
        console.error("Erreur dans checkActive:", error);
        res.status(500).json({ message: "Erreur lors de la vérification" });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        console.log("Vérification isAdmin pour user ID:", req.user.id);
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'Admin') {
            console.log("Accès refusé - pas admin ou utilisateur non trouvé:", req.user.id);
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }
        next();
    } catch (error) {
        console.error("Erreur dans isAdmin:", error);
        res.status(500).json({ message: "Erreur lors de la vérification admin" });
    }
};

router.post('/sign-up', upload.single('image'), registerUser);
router.post('/sign-in', signInUser);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.get('/view-users', fetchUsersByFilters);
router.post('/logout', logout);

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        console.log("Collection utilisée:", User.collection.collectionName);
        console.log("Utilisateurs récupérés:", JSON.stringify(users, null, 2));
        res.json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

router.delete("/delete/:id", authMiddleware, checkActive, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID reçu pour suppression:", id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("ID invalide:", id);
            return res.status(400).json({ message: "ID invalide" });
        }

        const user = await User.findById(id);
        console.log("Collection utilisée:", User.collection.collectionName);
        console.log("Utilisateur trouvé:", user ? JSON.stringify(user, null, 2) : 'Non trouvé');
        console.log("isVerified:", user ? user.isVerified : 'Utilisateur non trouvé');

        if (!user) {
            console.log("Utilisateur non trouvé dans la base avec ID:", id);
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (user.isVerified) {
            console.log("Suppression bloquée: isVerified est true");
            return res.status(403).json({ message: "Impossible de supprimer : ce compte est vérifié" });
        }

        await User.findByIdAndDelete(id);
        console.log("Utilisateur supprimé avec succès:", id);
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression:", error.message);
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
});

module.exports = router;

