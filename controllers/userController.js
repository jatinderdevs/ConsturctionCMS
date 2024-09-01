const User = require("../models/user");

exports.signin = (req, res, next) => {
  let redirectURL;
  if (req.user) {
    if (req.user.role === "superadmin") {
      redirectURL = "/dashboard/";
    } else if (req.user.role === "admin") {
      redirectURL = "/admin/";
    }
    return res.redirect(redirectURL);
  } else {
    return res.render("user/signin.ejs");
  }
};

exports.postSignin = async (req, res, next) => {
  let roleBaseDashboard;
  const { role } = req.user;
  if (role === "superadmin") {
    roleBaseDashboard = "/dashboard/";
  }
  if (role === "admin") {
    roleBaseDashboard = "/admin/";
  }
  const URL = res.locals.originalUrl || roleBaseDashboard;

  req.flash("success", "welcome to the application");
  return res.redirect(URL);
};

exports.profile = async (req, res, next) => {
  const { username } = req.user;
  const user = await User.findOne({ username }).populate({
    path: "companyId",
    select: "companyName",
  });

  res.render("user/profile", { user });
};

exports.logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "Successfully logout!");
    res.redirect("/user/signin");
  });
};
