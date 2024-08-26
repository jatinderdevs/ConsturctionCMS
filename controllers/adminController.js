const Company = require("../models/company");

module.exports.index = async (req, res, next) => {
  const { companyId } = req.user;
  const companyData = await Company.findOne({ _id: companyId });
  req.flash("success", "welcome back to the app");
  return res.render("admin/index", { companyData });
};
