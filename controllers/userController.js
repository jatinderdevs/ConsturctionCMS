const asyncWrap = require("../utilities/asyncWrap");
const User = require("../models/user");
const HandleError = require("../utilities/HandleError");

exports.signin = (req, res, next) => {
  return res.render("auth/signin.ejs");
};

exports.postSignin = asyncWrap(async (req, res, next) => {
  const URL = res.locals.originalUrl || "/dashboard/";

  req.flash("success", "welcome to the application");
  return res.redirect(URL);
});

exports.signup = asyncWrap(async (req, res, next) => {
  // let fakeUser = new User({
  //   username: "jazz",
  //   fullname: "jatinder singh",
  //   image:
  //     "https://www.pngitem.com/pimgs/m/581-5813504_avatar-dummy-png-transparent-png.png",
  //   isactive: true,
  //   email: "jssingh134@gmail.com",
  //   contactNumber: "+604 125 356",
  //   role: "superadmin",
  // });

  // await User.register(fakeUser, "123456");

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
