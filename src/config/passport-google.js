const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Your User Model
require("dotenv").config();
const db = require("./db");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM user2 WHERE id = ?", [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});
passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails[0].value;

      try {
        // Check if user exists in the database
        db.query(
          "SELECT * FROM user2 WHERE google_id = ?",
          [id],
          async (err, results) => {
            if (err) return done(err);

            if (results.length > 0) {
              if (!results[0].google_id) {
                db.query("UPDATE user2 SET google_id = ? WHERE email = ?", [
                  id,
                  email,
                ]);
              }
              return done(null, results[0]);
            } else {
              // Generate OTP and store in the database
              const otp = crypto.randomInt(100000, 999999).toString();
              const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 mins

              // Create a new user
              const newUser = {
                google_id: id,
                name: displayName,
                email: email,
                is_verified: false,
                otp: otp,
                otp_expiry: expiresAt,
              };

              db.query("INSERT INTO user2 SET ?", newUser, (err, result) => {
                if (err) return done(err);
                newUser.id = result.insertId;
                return done(null, newUser);
              });

              // Send OTP via email
              const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                },
                tls: {
                  rejectUnauthorized: false,
                },
              });

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
                subject:
                  "[Action Required] Verify Your Wedify Account – OTP Inside",
                html: emailHTML,
              });

              // Return success message (or response, if needed)
              done(null, newUser);
            }
          }
        );
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
