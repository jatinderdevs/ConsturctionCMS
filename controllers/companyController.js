const Company = require("../models/company");
const User = require("../models/user");

module.exports.index = async (req, res, next) => {
  if (!req.user.companyId) {
    return res.render("company/create.ejs", {
      formData: {},
      validateError: {},
    });
  }
  return res.redirect("/admin/");
};

module.exports.createUpdate = async (req, res, next) => {
  const { companyName, contactNumber, email, logo, address, bank, unitRate } =
    req.body;
  const addCompany = new Company({
    companyName,
    logo,
    contactNumber,
    email,
    address: address,
    bankDetails: bank,
    username: req.user,
    unitRate,
  });
  const company = await addCompany.save();
  const currentUser = await User.findOne({ _id: req.user._id });
  currentUser.companyId = company;
  await currentUser.save();
  req.flash("success", "welcome to the admin application");
  return res.redirect("/admin/");
};

module.exports.companyProfile = async (req, res, next) => {
  const { companyId } = req.user;
  const companyData = await Company.findOne({ _id: companyId });
  return res.render("company/companyprofile", { companyData });
};
