const express = require('express');
const { registerUser , signInUser , verifyEmail , resendVerificationEmail , fetchUsersByFilters,logout ,checkAuth} = require('../controllers/userController');
const upload = require('../middlewares/uploadImage');
const router = express.Router();
require('../controllers/userController');
const { User } = require('../models/user');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const authMiddlewaree = require('../middlewares/authorization');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
});

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Aucun token fourni' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
    }
};

// Pas de blocage basé sur estActif
const checkActive = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification" });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'Admin') {
            return res.status(403).json({ message: "Accès réservé aux administrateurs" });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification admin" });
    }
};
router.post('/sign-up', upload.single('image'), registerUser);
router.post('/sign-in', signInUser);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.get('/view-users', fetchUsersByFilters); 
router.get('/me', authMiddlewaree(), checkAuth); // Apply authentication middleware

router.get('/dashboard', authMiddleware, checkActive, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ message: "Bienvenue sur votre tableau de bord", role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Token invalide" });
        }

        user.estActif = true;
        user.verificationToken = undefined;
        user.lastLogin = new Date();
        await user.save();

        res.redirect(`http://localhost:3000/sign-in`);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification", error });
    }
});

router.delete("/delete/:id", authMiddleware, checkActive, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (user.estActif) {
            return res.status(403).json({ message: "Impossible de supprimer : ce compte est actif" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});
router.post('/logout', logout);


module.exports = router;
