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
  const { companyName, contactNumber, email, logo, address, bankDetails } =
    req.body;
  const addCompany = new Company({
    companyName,
    logo,
    contactNumber,
    email,
    address: address,
    bankDetails,
    username: req.user,
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
  return res.render("company/companyprofile.ejs", { companyData });
};

//edit company profile details
module.exports.edit = async (req, res, next) => {
  const { _id, companyId } = req.user;

  const company = await Company.findOne({ _id: companyId, username: _id });
  return res.render("company/companyEdit", {
    validateError: {},
    formData: company,
  });
};

module.exports.update = async (req, res, next) => {
  const { _id, companyId } = req.user;
  const isUpdate = await Company.updateOne(
    { _id: companyId, username: _id },
    { ...req.body }
  );
  if (!isUpdate) {
    return next();
  }
  req.flash("success", "Company Details has been updated successfully");
  return res.redirect("/company/profile");
};
