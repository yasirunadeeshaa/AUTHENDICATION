const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.verifyOTP(email);

        if (!user || !user.otp) {
            return res.status(400).json({ message: "User not found or OTP not generated!" });
        }

        console.log("Stored OTP:", user.otp);
        console.log("User entered OTP:", otp);

        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({ message: "Invalid OTP!" });
        }

        if (new Date(user.otp_expiry) < new Date()) {
            return res.status(400).json({ message: "OTP expired!" });
        }

        await User.markUserVerified(email);
        await User.storeOTP(email, null, null);  // Clears OTP

        res.json({ message: "Email verified successfully!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
