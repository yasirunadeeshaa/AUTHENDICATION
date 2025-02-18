const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
require("./src/config/passport-google");
require("./src/config/passport-facebook");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");

// Middleware (For parsing JSON)
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key", // Use environment variable for security
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello, Welcome to wedify");
});

app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/api/auth/google");
  }
  res.send(
    `<h1>Welcome ${req.user.name}!</h1><img src="${req.user.avatar}" />`
  );
});
app.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/api/auth/facebook");
    }
    res.send(
      `<h1>Welcome ${req.user.name}!</h1><img src="${req.user.avatar}" />`
    );
  });


// ✅ Middleware for CORS (if needed)
app.use(cors());

// Routes
app.use("/api/auth", authRoutes); // Keep one version of authRoutes
app.use("/api/users",userRoutes); // Keep one version of userRoutes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
