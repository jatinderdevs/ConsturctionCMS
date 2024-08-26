const asyncWrap = require("../asyncWrap");

module.exports.isCompany = asyncWrap(async (req, res, next) => {
  const { companyId } = req.user;
  if (!companyId) {
    req.flash("success", "Please create your Company Profile to start");
    return res.redirect("/company/create");
  }
  next();
});
