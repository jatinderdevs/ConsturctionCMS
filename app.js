require("dotenv").config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalPassport = require("passport-local");
const flash = require("connect-flash");
const bodyParser = require("body-parser");

const User = require("./models/user");

//routers
const userRoute = require("./routes/userRoute");
const dashboard = require("./routes/dashboard");

//settting View engines and views
app.set("view engine", "ejs");
app.set("views", "views");

//set ejsMate as engine
app.engine("ejs", ejsMate);

app.use(bodyParser.urlencoded({ extended: true }));
//session implement
app.use(
  session({
    // stroe has to be added
    secret: process.env.SESSION_SECERT,
    saveUninitialized: true,
    resave: false,
  })
);
app.use(flash());

//middleware for the flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalPassport(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//serve static file
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", userRoute);
app.use("/dashboard", dashboard);

app.use((err, req, res, next) => {
  const { status = 500, message = "something Went wrong!" } = err;
  res.status(status).send(message);
});

app.use("*", (req, res, next) => {
  res.send("page not found");
});

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    app.listen(3002, () => {
      console.log("data has been connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });
