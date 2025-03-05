

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User } = require("../models/user");
const { validationResult } = require("express-validator");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
});

const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phoneNumber, role } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const imageUrl = req.file ? req.file.path : "";
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            image: imageUrl,
            verificationToken,
            estActif: false,
        });

        await newUser.save();

        const verificationUrl = `http://localhost:5001/api/users/verify/${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: "Vérifiez votre email (Optionnel)",
            html: `Cliquez sur ce lien pour vérifier votre email et activer votre compte : <a href="${verificationUrl}">${verificationUrl}</a><br>Vous pouvez vous connecter sans vérification.`,
        });

        res.status(201).json({ message: "User registered successfully. Check your email for verification (optional).", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const signInUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Pas d'obligation de vérification : générer le token même si estActif est false
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, estActif: user.estActif },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset",
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Reset password link sent!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// Reset Password

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// Email Verification

const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params;
    const { email, redirect } = req.query; 

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        jwt.verify(verificationToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: "Invalid or expired verification token" });
            }

            if (decoded.userId !== user._id.toString()) {
                return res.status(400).json({ message: "Token mismatch" });
            }

            user.isVerified = true;
            user.verificationToken = verificationToken; 
            await user.save();

            res.redirect(`http://localhost:3000/${redirect}?verified=true`);
        });
    } catch (error) {
        console.error("Error during email verification:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Resend Verification Email

const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const verificationUrl = `http://localhost:5001/api/users/verify-email/${verificationToken}?email=${user.email}&redirect=sign-in`;
        const mailOptions = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: "Email Verification",
            text: `Please click the link to verify your email address: ${verificationUrl}`,
        };



        await transporter.sendMail(mailOptions);
        user.verificationToken = verificationToken;
        await user.save();
        res.status(200).json({ message: "Verification email resent!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Admin Fetch Users

const fetchUsersByFilters = async (req, res) => {
    const { username, email, phoneNumber, role } = req.query;

    try {
        const query = {};

        if (username) {
            query.name = { $regex: username, $options: 'i' };
        }

        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }

        if (phoneNumber) {
            query.phoneNumber = { $regex: phoneNumber, $options: 'i' };
        }

        if (role) {
            query.role = role;
        }

        const users = await User.find(query);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
const logout = (req, res) => {
    res.cookie("token", "", { maxAge: 0 });
    res.json({ message: "Logged out successfully" });
};

const checkAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(req.user.userId).select("-password"); // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { 
    registerUser, 
    signInUser, 
    requestPasswordReset, 
    resetPassword, 
    verifyEmail, 
    resendVerificationEmail,
    fetchUsersByFilters,
    logout,
    checkAuth,
};
