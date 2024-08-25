const Company = require("../models/company");

module.exports.index = async (req, res, next) => {
  // const data = await Company.findOne({ _id: "66cae8358c8c26119e219e65" });
  // data.bankDetails.ABN_number = 5656;
  // await data.save();
  return res.render("company/create.ejs", { formData: {}, validateError: {} });
};

module.exports.createUpdate = async (req, res, next) => {
  console.log(req.body);

  // const { companyName, contactNumber, email, logo, address, bank, unitRate } =
  //   req.body;
  // const addCompany = new Company({
  //   companyName,
  //   logo,
  //   contactNumber,
  //   email,
  //   address: address,
  //   bankDetails: bank,
  //   username: req.user,
  //   unitRate,
  // });
  // await addCompany.save();

  //add user table compnay _id
};
