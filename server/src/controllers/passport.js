const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models/user');

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

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (!user) {
                    // Mot de passe par défaut temporaire
                    const defaultPassword = 'defaultPassword123'; // Peut être changé
                    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: hashedPassword, // Mot de passe par défaut hashé
                        role: 'Admin', // Rôle par défaut
                        estActif: false,
                        isVerified: false,
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: '/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name'],
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || `facebook_${profile.id}@example.com`;
                let user = await User.findOne({ email });

                if (!user) {
                    // Mot de passe par défaut temporaire
                    const defaultPassword = 'defaultPassword123'; // Peut être changé
                    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

                    user = new User({
                        facebookId: profile.id,
                        name: `${profile.name.givenName} ${profile.name.familyName}`,
                        email,
                        password: hashedPassword, // Mot de passe par défaut hashé
                        phoneNumber: '0000000000', // Valeur temporaire
                        role: 'Business owner', // Rôle par défaut
                        estActif: false,
                        isVerified: false,
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (err) {
                console.error('Erreur lors de l\'authentification Facebook:', err);
                return done(err, false);
            }
        }
    )
);