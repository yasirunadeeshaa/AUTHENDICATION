const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.signup = async (req, res) => {
    try{
        const {name,email,password,role}= req.body;

        if(!name || !email || !password || !role){
            return res.status(400).json({message:"Please fill all the fields"});
        }

        // Check if user already exists
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

        // Create the user with OTP
        await User.createUser(name, email, password,role, otp, otpExpiry);

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        // HTML Email Content
        const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Wedify Account</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h2 {
                    color: #4CAF50;
                }
                p {
                    font-size: 16px;
                    color: #333;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin: 10px 0;
                    padding: 10px;
                    display: inline-block;
                    border: 2px dashed #4CAF50;
                    border-radius: 5px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to Wedify! 🎉</h2>
                <p>Thank you for signing up. To complete your registration, please verify your email address using the OTP below:</p>
                <div class="otp">${otp}</div>
                <p>This OTP is valid for <strong>15 minutes</strong>.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <div class="footer">
                    <p>Need help? Contact our support team at <a href="mailto:support@wedify.com">support@wedify.com</a></p>
                    <p>&copy; 2025 Wedify. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"Wedify Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "[Action Required] Verify Your Wedify Account – OTP Inside",
            html: emailHTML
        });

        res.status(201).json({ message: "User registered! Please check your email for OTP verification." });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
};

