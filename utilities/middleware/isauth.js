const asyncWrap = require("../asyncWrap");

module.exports.isauth = asyncWrap(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "you do note have permission to access this page");
    req.session.requestedUrl = req.originalUrl;
    return res.redirect("/user/signin");
  }
  const currentDate = new Date();
  const subDate = req.user.subscriptionExpireOn;
  const isactive = req.user.isactive;

  function validateUser() {
    if (subDate <= currentDate) {
      return false;
    } else if (!isactive) {
      return false;
    }
    return true;
  }
  const isValid = validateUser();
  if (!isValid) {
    req.flash(
      "error",
      "your subscripation has been expired please contact admin to activate"
    );
    req.logout((err) => {
      if (err) {
        next(err);
      }
    });
    return res.redirect("/user/signin");
  }
  next();
});

//save requested URL to redirect when signin
module.exports.redirectUrl = asyncWrap(async (req, res, next) => {
  if (req.session.requestedUrl) {
    res.locals.originalUrl = req.session.requestedUrl;
  }
  next();
});

//check user role
module.exports.isAdmin = asyncWrap(async (req, res, next) => {
  const { role, companyId } = req.user;

  if (role !== "superadmin") {
    if (companyId !== "undefind") {
      req.flash("error", "you have not permission to access this link");
      return res.redirect("/admin/");
    } else {
      req.flash("error", "complete your company profile");
      return res.redirect("/company/create");
    }
  }
  next();
});
