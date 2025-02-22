
// router.get("/admin", authenticateToken, (req, res) => {
//   res.json("admin");
// })
// //only vendors
// router.get("/vendor", authenticateToken, (req, res) => {
//   res.json("vendor");
// })

// //only customers
// router.get("/customer", authenticateToken, (req, res) => {
//   res.json("customer");
// })

// module.exports = router;

const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

router.get("/admin", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied! Admins only." });
    }
    res.json("Welcome, Admin!");
});

router.get("/vendor", authenticateToken, (req, res) => {
    if (req.user.role !== "vendor") {
        return res.status(403).json({ message: "Access denied! Vendors only." });
    }
    res.json("Welcome, Vendor!");
});

router.get("/customer", authenticateToken, (req, res) => {
    if (req.user.role !== "customer") {
        return res.status(403).json({ message: "Access denied! Customers only." });
    }
    res.json("Welcome, Customer!");
});

module.exports = router;
