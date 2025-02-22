// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const authenticateToken = (req, res, next) => {
//     const token = req.header("Authorization");
//     if (!token) {
//         return res.status(401).json({ message: "Access denied! No token provided." });
//     }

//     try {
//         const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         res.status(403).json({ message: "Invalid or expired token!" });
//     }
// };

// module.exports = authenticateToken;

// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const authenticateToken = (req, res, next) => {
//     let token;
//     let authHeader = req.headers.Authorization || req.headers.authorization;
//     if (authHeader && authHeader.startsWith("Bearer")) {
//         token = authHeader.split(" ")[1];

//         if (!token) {
//             return res.status(401).json({ message: "Access denied! No token provided." });
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.user = decoded;
//             console .log(req.user);
//             next();
//         }
//         catch (err) {
//             res.status(403).json({ message: "Invalid or expired token!" });
//         }
        
//     }else{
//         return res.status(401).json({ message: "Access denied! No token provided." });
//     }
// }

// module.exports = authenticateToken;

const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]; // Fix header name (lowercase)
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied! No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        console.log("Authenticated User:", req.user);
        next(); // Proceed to the next middleware
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(403).json({ message: "Invalid or expired token!" });
    }
};

module.exports = authenticateToken;
