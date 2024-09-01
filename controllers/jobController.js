const Company = require("../models/company");
const Job = require("../models/Jobs");

module.exports.index = async (req, res, next) => {
  const rows = 1;
  const { companyId } = req.user;
  const jobs = await Job.find({ companyId: companyId });
  res.render("job/index", { jobs, rows });
};

module.exports.create = async (req, res, next) => {
  res.render("job/create", {
    formData: { jobDate: new Date() },
    validateError: {},
  });
};

module.exports.createPost = async (req, res, next) => {
  const { jobNumber, jobDate, location, jobSize } = req.body;
  const { companyId, _id } = req.user;
  const { unitRate } = await Company.findOne({ _id: companyId }).select(
    "unitRate"
  );

  const newJob = new Job({
    jobNumber,
    jobDate,
    jobSize,
    location,
    unitRate,
    companyId,
    username: _id,
    invoice: {
      invoiceNumber: Math.floor(1000 + Math.random() * 9000),
      IsPaid: false,
    },
  });
  await newJob.save();
  req.flash("success", "Job has been added successfully");
  return res.redirect("/admin/");
};

module.exports.job = async (req, res, next) => {
  const { id, company } = req.params;
  const { _id } = req.user;
  const job = await Job.findOne({
    companyId: company,
    _id: id,
    username: _id,
  }).populate("companyId");

  const { jobSize, unitRate, additionalCharges } = job;
  const add_charges = additionalCharges.reduce(
    (total, val) => total + val.charges,
    0
  );

  const jobCharges = jobSize * unitRate;
  const subtotal = jobCharges + add_charges;
  const GST = subtotal * 0.1;
  const totalInvoice = subtotal + GST;

  return res.render("job/job.ejs", {
    job,
    jobCharges,
    GST,
    totalInvoice,
    subtotal,
  });
};

module.exports.additionalCharges = async (req, res, next) => {
  const { _id } = req.user;
  const { jobId, chargesInfo, charges, companyId } = req.body;
  const job = await Job.findOne({
    _id: jobId,
    username: _id,
  });
  job.additionalCharges.push({
    chargeInfo: chargesInfo,
    charges,
  });
  await job.save();
  req.flash("success", "Additional Charges has been added successfully");
  res.redirect(`/job/view/${jobId}/${companyId}`);
};

module.exports.genrateInvoice = async (req, res, next) => {
  //genrate invoice code create new page where you can see proper invoice
};
