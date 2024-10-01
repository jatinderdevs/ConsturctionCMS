const Company = require("../models/company");
const Jobs = require("../models/Jobs");

module.exports.index = async (req, res, next) => {
  const { companyId } = req.user;
  const companyData = await Company.findOne({ _id: companyId });
  const jobCount = await Jobs.find({ companyId }).countDocuments();
  req.flash("success", "welcome back to the app");
  return res.render("admin/index", { companyData, jobCount });
};
