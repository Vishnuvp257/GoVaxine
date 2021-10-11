const path = require("path");
const exp = require("constants");

const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");

//connecting to database
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {})
  .then((con) => console.log("DB connection successfully"));

//--------------------------------------------------------------------------------------------------------------//
//--------------------------------------------------------------------------------------------------------------//

const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieparser = require("cookie-parser");

const app = express();
const userModel = require("./public/js/user");
const reminderModel = require("./public/js/reminders");
const messagebird = require("messagebird")("zNGRDFttQaFlPWWbDnLGTK0Mr");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// 1) GLOBAL MIDDLEWARES

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cookieparser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//body parser
app.use(express.json());
app.use(express.static(`./public`));

app.use((req, res, next) => {
  next();
});
//entry points
app.use(userModel.isLoggedIn);

app.get("/", (req, res) => {
  res.status(200).render("_base");
});

app.get("/login", (req, res) => {
  res.status(200).render("_login");
});

app.get("/signup", (req, res) => {
  res.status(200).render("_signup");
});

app.get("/confrim", (req, res) => {
  res.status(200).render("email/confrim");
});

app
  .post("/register/signup", userModel.signup)
  .post("/register/login", userModel.logIn)
  .get("/register/logout", userModel.logOut)
  .post("/login/forgotpassword", userModel.forgotPassword);

app.post("/register/confrim", userModel.confrim);

app
  .patch("/login/resetpassword/:token", userModel.resetPassword)
  .patch(
    "/login/updatepassword",
    userModel.protectFeatures,
    userModel.updatePassword
  );

app.post("/reminder", userModel.protectFeatures, reminderModel.setReminder);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  //console.log(`hello from the server:${port}`);
});
