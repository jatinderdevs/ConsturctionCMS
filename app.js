require("dotenv").config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalPassport = require("passport-local");
const User = require("./models/user");
const HandleError = require("./utilities/handleError");
const asyncWrap = require("./utilities/asyncWrap");

//routers
const userRoute = require("./routes/userRoute");
//settting View engines and views
app.set("view engine", "ejs");
app.set("views", "views");
//set ejsMate as engine
app.engine("ejs", ejsMate);

//session implement
app.use(
  session({
    secret: process.env.SESSION_SECERT,
    saveUninitialized: true,
    resave: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalPassport(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//serve static file
app.use(express.static(path.join(__dirname, "public")));

app.get("/err", (req, res) => {
  const token = "dsf";

  if (token === "jatinder") {
    return res.send("ok");
  }
  throw new HandleError(500, "something Went Wrong");
});
app.use("/auth", userRoute);

app.use((err, req, res, next) => {
  const { status = 500, message = "somwthing Went wrong!" } = err;
  res.status(status).send(message);
});
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    app.listen(8080, () => {
      console.log("data has been connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });
