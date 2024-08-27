const Company = require("../models/company");
const Job = require("../models/Jobs");

module.exports.index = async (req, res, next) => {
  const rows = 1;
  const { companyId } = req.user;
  const jobs = await Job.find({ companyId: companyId });

  res.render("job/index", { jobs, rows });
};

module.exports.create = async (req, res, next) => {
  res.render("job/create");
};

module.exports.createPost = async (req, res, next) => {
  const { jobNumber, jobDate, location, comment, jobSize } = req.body;
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
    comment,
    username: _id,
  });
  await newJob.save();
  req.flash("success", "Job has been added successfully");
  return res.redirect("/admin/");
};

module.exports.job = async (req, res, next) => {
  const { id, company } = req.params;

  const job = await Job.findOne({ companyId: company, _id: id }).populate(
    "companyId"
  );

  return res.render("job/job.ejs", { job });
};
