const asyncWrap = require("../asyncWrap");

module.exports.isauth = asyncWrap(async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "you do note have permission to access this page");
    req.session.requestedUrl = req.originalUrl;
    return res.redirect("/auth/signin");
  }
  next();
});

module.exports.redirectUrl = asyncWrap(async (req, res, next) => {
  if (req.session.requestedUrl) {
    res.locals.originalUrl = req.session.requestedUrl;
  }
  next();
});
