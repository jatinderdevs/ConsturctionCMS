const asyncWrap = require("../utilities/asyncWrap");

exports.signin = (req, res, next) => {
  return res.render("auth/signin.ejs");
};

exports.postSignin = asyncWrap(async (req, res, next) => {
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
