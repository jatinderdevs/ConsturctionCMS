const asyncWrap = require("../asyncWrap");
const Contractor = require("../../models/contractor");

module.exports.isCompany = asyncWrap(async (req, res, next) => {
  const { companyId } = req.user;

  if (!companyId) {
    req.flash("success", "Please create your Company Profile to start");
    return res.redirect("/company/create");
  }
  next();
});

//check the contracotr details (at least one should be exist)
module.exports.isContractor = asyncWrap(async (req, res, next) => {
  const { _id } = req.user;

  const isContractorExist = await Contractor.findOne({ username: _id });

  if (!isContractorExist) {
    req.flash(
      "success",
      "Please Complete your contractor (job Provider) Details"
    );
    return res.redirect("/contractor/create");
  }
  next();
});
