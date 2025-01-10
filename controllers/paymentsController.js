const Job = require("../models/Jobs");

exports.payments = async (req, res, next) => {
  const payments = await Job.find();

  // payments.forEach(({ invoice }) => {
  //   console.log(invoice);
  // });

  return res.render("payments/index.ejs");
};
