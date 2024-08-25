const asyncWrap = require("../utilities/asyncWrap");
const User = require("../models/user");

exports.signin = (req, res, next) => {
  return res.render("auth/signin.ejs");
};

exports.postSignin = asyncWrap(async (req, res, next) => {
  const URL = res.locals.originalUrl || "/dashboard/";

  req.flash("success", "welcome to the application");
  return res.redirect(URL);
});

exports.signup = asyncWrap(async (req, res, next) => {
  res.render("auth/signin.ejs");
});

exports.logout = asyncWrap(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "Successfully logout!");
    res.redirect("/auth/signin");
  });
});
