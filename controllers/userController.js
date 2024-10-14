const User = require("../models/user");

exports.signin = (req, res, next) => {
  let redirectURL;
  if (req.user) {
    //check user role accordingly show dashboard
    redirectURL = req.user.role === "superadmin" ? "/dashboard/" : "/admin/";
    res.redirect(redirectURL);
  } else {
    res.render("user/signin.ejs");
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

exports.editProfile = async (req, res, next) => {
  const { username } = req.user;
  const user = await User.findOne({ username });
  return res.render("user/updateProfile.ejs", {
    user,
  });
};
exports.updateProfile = async (req, res, next) => {
  const data = req.body;

  const { username } = req.user;

  const user = await User.findOneAndUpdate({ username }, { ...data });

  await user.save();
  req.flash("success", "Profile Deatils has been updated successfully");
  return res.redirect("/user/profile");
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
