const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');
const { Activity } = require('../models/activity');
require('dotenv').config();
const upload = require('../middlewares/uploadImage');
const nodemailer = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/sign-in' }),
    async (req, res) => {
        try {
            const user = req.user;
            console.log("Utilisateur après Google auth:", user);

            const existingUser = await User.findOne({ email: user.email });
            if (existingUser && existingUser.isVerified) {
                const sessionToken = jwt.sign(
                    { userId: existingUser._id, role: existingUser.role },
                    process.env.JWT_SECRET || 'secret_key',
                    { expiresIn: '24h' }
                );
                console.log("Utilisateur existant, token de session:", sessionToken);

                await Activity.create({ userId: existingUser._id, action: "Connexion Google", date: new Date() });

                res.redirect(`http://localhost:3000/auth-callback?token=${sessionToken}&role=${existingUser.role}`);
            } else {
                const verificationToken = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET || 'secret_key',
                    { expiresIn: '24h' }
                );
                console.log("Token généré pour Google (nouvel utilisateur):", verificationToken);

                await user.save();

                await transporter.sendMail({
                    to: user.email,
                    subject: "Vérifiez votre compte",
                    html: `Veuillez vérifier votre compte pour activer votre profil. Complétez votre profil pour finaliser l'inscription.`,
                });

                await Activity.create({ userId: user._id, action: "Inscription Google", date: new Date() });

                res.redirect(`http://localhost:3000/complete-profile?userId=${user._id}&provider=google`);
            }
        } catch (error) {
            console.error("Erreur lors de la callback Google:", error);
            res.redirect('/sign-in');
        }
    }
);

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/sign-in' }),
    async (req, res) => {
        try {
            const user = req.user;
            console.log("Utilisateur après Facebook auth:", user);

            const existingUser = await User.findOne({ email: user.email });
            if (existingUser && existingUser.isVerified) {
                const sessionToken = jwt.sign(
                    { userId: existingUser._id, role: existingUser.role },
                    process.env.JWT_SECRET || 'secret_key',
                    { expiresIn: '24h' }
                );
                console.log("Utilisateur existant, token de session:", sessionToken);

                await Activity.create({ userId: existingUser._id, action: "Connexion Facebook", date: new Date() });

                res.redirect(`http://localhost:3000/auth-callback?token=${sessionToken}&role=${existingUser.role}`);
            } else {
                const verificationToken = jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET || 'secret_key',
                    { expiresIn: '24h' }
                );
                console.log("Token généré pour Facebook (nouvel utilisateur):", verificationToken);

                await user.save();

                await transporter.sendMail({
                    to: user.email,
                    subject: "Vérifiez votre compte",
                    html: `Veuillez vérifier votre compte pour activer votre profil. Complétez votre profil pour finaliser l'inscription.`,
                });

                await Activity.create({ userId: user._id, action: "Inscription Facebook", date: new Date() });

                res.redirect(`http://localhost:3000/complete-profile?userId=${user._id}&provider=facebook`);
            }
        } catch (error) {
            console.error("Erreur lors de la callback Facebook:", error);
            res.redirect('/auth/sign-in');
        }
    }
);

// Compléter le profil
router.post('/complete-profile', upload.single('image'), async (req, res) => {
    const { userId, phoneNumber, password, role } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        user.phoneNumber = phoneNumber;
        if (password) {
            user.password = await bcrypt.hash(password, 10); // Mise à jour du mot de passe
        }
        user.role = role;
        if (req.file) {
            user.image = req.file.path;
        }
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "Profil complété et vérifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la complétion du profil:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

module.exports = router;