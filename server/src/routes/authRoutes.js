const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/sign-in' }),
    async (req, res) => {
        const user = req.user;

        // Générer un mot de passe temporaire pour chaque connexion
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Mettre à jour l'utilisateur avec le nouveau mot de passe et le token
        user.password = hashedPassword;
        user.verificationToken = verificationToken;
        // Ne pas modifier estActif ici, laisser false jusqu'à vérification manuelle
        await user.save();

        // Email 1 : Mot de passe temporaire
        await transporter.sendMail({
            to: user.email,
            subject: "Votre mot de passe temporaire",
            html: `Voici votre mot de passe temporaire pour vous connecter : <strong>${tempPassword}</strong><br>Utilisez-le pour vous connecter immédiatement.`,
        });

        // Email 2 : Lien de vérification (optionnel)
        const verificationUrl = `http://localhost:5001/api/users/verify/${verificationToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: "Vérifiez votre connexion Google (Optionnel)",
            html: `Cliquez sur ce lien pour vérifier votre compte (facultatif) : <a href="${verificationUrl}">${verificationUrl}</a><br>Vous pouvez vous connecter sans vérification.`,
        });

        await Activity.create({ userId: user.id, action: "Connexion Google", date: new Date() });

        // Redirection vers /verify-email avec email et token
        res.redirect(`http://localhost:3000/verify-email?email=${user.email}&token=${verificationToken}`);
    }
);

// Même logique pour Facebook (simplifiée ici pour brièveté)
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    async (req, res) => {
        const user = req.user;

        if (user.estActif) {
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );
            await Activity.create({ userId: user.id, action: "Connexion Facebook", date: new Date() });
            res.redirect(`http://localhost:3000/admin-dashboard?token=${token}`);
        } else {
            const verificationToken = require('crypto').randomBytes(32).toString('hex');
            user.verificationToken = verificationToken;
            user.estActif = false;
            await user.save();

            const verificationUrl = `http://localhost:5001/api/users/verify/${verificationToken}`;
            await transporter.sendMail({
                to: user.email,
                subject: "Vérifiez votre connexion Facebook",
                html: `Cliquez sur ce lien pour vérifier votre connexion : <a href="${verificationUrl}">${verificationUrl}</a>`,
            });

            await Activity.create({ userId: user.id, action: "Connexion Facebook", date: new Date() });
            res.redirect(`http://localhost:3000/verify-email?email=${user.email}`);
        }
    }
);

router.post('/complete-profile', upload.single('image'), async (req, res) => {
    try {
        const { userId, password, confirmPassword, phoneNumber, role } = req.body;
        if (!userId) return res.status(400).json({ message: "ID utilisateur manquant." });
        if (password !== confirmPassword) return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const imageUrl = req.file ? req.file.path : "";

        const user = await User.findByIdAndUpdate(userId, {
            password: hashedPassword,
            phoneNumber,
            role,
            image: imageUrl,
            verificationToken: require('crypto').randomBytes(32).toString('hex'),
        }, { new: true });

        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        const verificationUrl = `http://localhost:5001/api/users/verify/${user.verificationToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: "Vérifiez votre compte",
            html: `Cliquez sur ce lien pour vérifier votre compte : <a href="${verificationUrl}">${verificationUrl}</a>`,
        });

        res.status(200).json({ message: "Profil complété. Vérifiez votre email.", userId: user._id });
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({ message: "Erreur serveur.", error });
    }
});

router.post('/update-profile', async (req, res) => {
    try {
        const { userId, phoneNumber } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        user.phoneNumber = phoneNumber;
        await user.save();
        await Activity.create({ userId: userId, action: "Mise à jour du profil" });

        res.json({ message: "Profil mis à jour avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

module.exports = router;