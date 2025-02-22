const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const passport = require("../config/passport-google");

const authenticateToken = require("../middleware/authMiddleware");

const signupController = require("../controllers/signupController");
const loginController = require("../controllers/loginController");
const verification = require("../controllers/verifyEmailController");
const logoutController = require("../controllers/logoutController");
const forgotPasswordController = require("../controllers/forgotPasswordController");
const resetPasswordController = require("../controllers/resetPasswordController");

// Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  loginController.login
);

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  signupController.signup
);

router.post(
  "/verify",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("code")
      .isLength({ min: 6 })
      .withMessage("Code must be at least 6 characters"),
  ],
  verification.verifyEmail
);

router.post(
  "/logout",
  [body("email").isEmail().withMessage("Invalid email")],
  logoutController.logout
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid email")],
  forgotPasswordController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("code")
      .isLength({ min: 6 })
      .withMessage("Code must be at least 6 characters"),
  ],
  resetPasswordController.resetPassword
);

// Google Auth Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard"); // Redirect to a dashboard or homepage
  }
);

router.get(
    "/facebook",
    passport.authenticate("facebook", { scope: ["email"] }) // Request email from Facebook
  );
  
  // Facebook Auth Callback
  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/dashboard"); // Redirect to dashboard or homepage after login
    }
  );

module.exports = router;
