const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.getUserByEmail(email);
        console.log("User from DB:", user);

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password  !" });
        }

        // Hash the password
        //const hashed2Password = await bcrypt.hash(password, 10);

        console.log("Stored password:", user.password);
        console.log("Entered password:", password);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("❌ Password does not match.");
            return res.status(401).json({ message: "Invalid email or password !" });
        }
        //Generate JWT token
        const token = jwt.sign(
            { id: user.id,role: user.role}, //vendorType: user.vendor_type },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        console.log("Generated Token:", token); 
        console.log("JWT Secret:", process.env.JWT_SECRET);
        console.log("Received Authorization Header:", req.headers["authorization"]);


        if(passwordMatch) {
            return res.status(200).json({ message: "Login successful!", token });
            
            await User.updateLoginStatus(user.email, true);
            console.log("Login status updated to true.");
            
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: "Please verify your email first!" });
            console.log("Please verify your email first!");
        }

        //res.json({ message: "Login successful", token });

        // // Generate JWT token
        // const token = jwt.sign(
        //     { id: user.id, role: user.role, vendorType: user.vendor_type },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "1h" }
        // );

        // res.json({ message: "Login successful", token });
        
    } catch (err) {
        console.error("🔥 Error in login:", err.message); // Log the error message
        res.status(500).json({ error: err.message }); // Return the error message to the client
    }
};