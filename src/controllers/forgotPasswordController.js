const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        //const otp = "123456"; // For testing purposes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 15 minutes

        // Store OTP in the database
        await User.storeOTP(email, otp, expiresAt);
        //const resetLink = `http://localhost:3000/reset-password?email=${email}&otp=${otp}`;

        // Send email with reset link
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            port: 465, //587, 
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Allows self-signed certificates
            }
        });

        const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    text-align: center;
                }
                .header {
                    background-color: #007bff;
                    padding: 20px;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .header h1 {
                    color: #ffffff;
                    margin: 0;
                    font-size: 22px;
                }
                .content {
                    padding: 20px;
                    color: #333333;
                    font-size: 16px;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    margin: 10px 0;
                }
                .footer {
                    background-color: #f4f4f4;
                    padding: 15px;
                    font-size: 14px;
                    color: #666666;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                }
                .footer a {
                    color: #007bff;
                    text-decoration: none;
                }
                .btn {
                    display: inline-block;
                    padding: 12px 20px;
                    margin-top: 10px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #007bff;
                    border-radius: 5px;
                    text-decoration: none;
                }
                .btn:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>

            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Dear User,</p>
                    <p>We received a request to reset your password. Use the OTP below to reset your password:</p>
                    <p class="otp">{{OTP}}</p>
                    <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
                    <a href="{{RESET_LINK}}" class="btn">Reset Password</a>
                </div>
                <div class="footer">
                    <p>If you need any help, contact our support team at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>.</p>
                    <p>Thank you,<br>Your Company Team</p>
                </div>
            </div>

        </body>
        </html>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: emailTemplate
        });

        res.json({ message: "OTP sent to email. Please check your email!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};