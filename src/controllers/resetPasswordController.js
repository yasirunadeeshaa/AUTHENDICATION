const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Retrieve stored OTP and expiry
        // const user = await User.verifyOTP(email, otp);
        // if (!user || user.otp !== otp) {
        //     return res.status(400).json({ message: "Invalid OTP!" });
        // }
        const user = await User.verifyOTP(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid OTP!" });
        }

        // Check if OTP is expired
        if (new Date(user.otp_expiry) < new Date()) {
            return res.status(400).json({ message: "OTP expired!" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password in database
        await User.updatePassword(email, newPassword);
        await User.markUserVerified(email);

        // Update password in database
        // await User.updatePassword(email, newPassword);

        res.json({ message: "Password reset successful!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};