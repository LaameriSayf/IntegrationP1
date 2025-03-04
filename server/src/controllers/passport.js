const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { User } = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                password: hashedPassword,
                role: 'Admin',
                estActif: false,
                verificationToken: require('crypto').randomBytes(32).toString('hex'),
            });

            await user.save();
            const verificationUrl = `http://localhost:5001/api/users/verify/${user.verificationToken}`;
            await transporter.sendMail({
                to: user.email,
                subject: "Vérifiez votre compte Google",
                html: `Cliquez sur ce lien pour vérifier votre compte : <a href="${verificationUrl}">${verificationUrl}</a>`,
            });
        }
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ["id", "emails", "name"],
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value || `facebook_${profile.id}@example.com`;
        let user = await User.findOne({ email });

        if (!user) {
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = new User({
                facebookId: profile.id,
                name: `${profile.name.givenName} ${profile.name.familyName}`,
                email,
                password: hashedPassword,
                phoneNumber: "0000000000",
                role: "Business owner",
                estActif: false,
                verificationToken: require('crypto').randomBytes(32).toString('hex'),
            });

            await user.save();
            const verificationUrl = `http://localhost:5001/api/users/verify/${user.verificationToken}`;
            await transporter.sendMail({
                to: user.email,
                subject: "Vérifiez votre compte Facebook",
                html: `Cliquez sur ce lien pour vérifier votre compte : <a href="${verificationUrl}">${verificationUrl}</a>`,
            });
        }
        return done(null, user);
    } catch (err) {
        console.error("Erreur lors de l'authentification Facebook:", err);
        return done(err, false);
    }
}));