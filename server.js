require("dotenv").config();
require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport"); // for google auth
const session = require("express-session"); // for google auth, create session
const connectDB = require("./config/dbConn");
// const morgan = require("morgan");
const corsOptions = require("./config/corsOptions");

const userRouters = require("./routers/userRouters");
const houseRouters = require("./routers/houseRouters");
const eventRouters = require("./routers/eventRouters");
const helperRouters = require("./routers/helperRouters");
// -----------------------------------------------------------------------------------
// define important constants:
const app = express();
const PORT = process.env.PORT || 8080;

// console.log(`Mode: ${process.env.NODE_ENV}`);
connectDB();

// MIDDLEWARES
// -----------------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: {secure: true}, // uncomment this line for production
  })
);
// app.use(morgan("dev"));

app.use(passport.initialize());
app.use(passport.session()); // to use req.user from session
// -----------------------------------------------------------------------------------

// passport config
require("./config/passport")(passport);

// ROUTES
// -----------------------------------------------------------------------------------
app.get("^/$|/index(.html)?", (req, res) => {
  res.send("hello");
});
// 1. /auth (due to passport, didn't separated into routers)
// @desc    google Login
// @route   GET /auth/google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// @desc    Google auth callback
// @route   GET /auth/google/callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  function (req, res) {
    res.redirect("https://prisms-house-events-admin.onrender.com/");
  }
);

// @desc    Logout Google user
// @route   GET /auth/logout
app.get("/auth/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    //res.send("done");
    res.redirect("https://prisms-house-events-admin.onrender.com/");
  });
});

// @desc    Get Logged-in user
// @route   GET /auth/user
app.get("/auth/user", (req, res) => {
  // req.user in cookie (deserialized user)
  res.send(req.user);
});

// 2. /api/user
app.use("/api/user", userRouters);
// 3. /api/house
app.use("/api/house", houseRouters);
// 4. /api/event
app.use("/api/event", eventRouters);
// 5. /api/upload-image
app.use("/api", helperRouters);
// -----------------------------------------------------------------------------------

// error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// PORT connection & DB connection check
mongoose.connection.once("open", () => {
  console.log("Mongo DB successfully connected");
  app.listen(PORT, console.log(`Server is running on PORT ${PORT}`));
});
mongoose.connection.on("error", (err) => {
  console.log(`Mongo DB error: ${err}`);
});
