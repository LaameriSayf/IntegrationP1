const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    console.log("Received forgot-password request for email:", email);

    if (!email) {
        console.log("No email provided");
        return res.status(400).json({ message: 'Please provide an email address' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("No user found with this email:", email);
            return res.status(404).json({ message: 'No user found with that email address' });
        }

        console.log("User found:", user.email);

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1h expiration

        await user.save();

        console.log("Reset token generated:", resetToken);

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER1, 
                pass: process.env.EMAIL_PASS1,
            },
        });

        const resetLink = `http://localhost:3000/reset-password/${user._id}/${resetToken}`;
        console.log("Sending email to:", user.email);

        const mailOptions = {
            from: process.env.EMAIL_USER1,
            to: user.email,
            subject: 'Password Reset',
            text: `We received a request to reset your password. If you made this request, please click the link below to set a new password: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");

        return res.status(200).json({ message: 'Password reset link sent to your email' });

    } catch (error) {
        console.error("Error in password reset process:", error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const resetPassword = async (req, res) => {
    const { userId, token } = req.params;
    const { password } = req.body;

    try {
        // Find user with the given reset token and check expiration
        const user = await User.findById(userId);

        if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ Status: "Error", message: "Invalid or expired token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);


        /// Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({ Status: "Success", message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ Status: "Error", message: "Server error" });
    }
};

module.exports = { forgotPassword, resetPassword };
