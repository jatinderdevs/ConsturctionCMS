const Company = require("../models/company");
const Contractor = require("../models/contractor");
const Job = require("../models/Jobs");
const { jobValidation } = require("../utilities/validations/jobValidate");

module.exports.index = async (req, res, next) => {
  const rows = 1;
  const { companyId } = req.user;
  //page items limit
  const pageSize = 10;
  const page = parseInt(req.query.page) || 1;

  //count pages for the pagination
  const totalItems = await Job.find({ companyId: companyId }).countDocuments();
  const totalPages = Math.ceil(totalItems / pageSize);

  const skipRecords = (page - 1) * pageSize;
  const jobs = await Job.find({ companyId: companyId })
    .skip(skipRecords)
    .limit(pageSize)
    .sort({ "invoice.IsPaid": 1 });
  res.render("job/index", { jobs, rows, totalPages, currentPage: page });
};

module.exports.create = async (req, res, next) => {
  const { _id, companyId } = req.user;
  const contractors = await Contractor.find({
    username: _id,
    companyId,
    isActive: true,
  });

  // if there is no contractor or all the contractor deactive redirect to contract page
  if (contractors.length === 0) {
    req.flash(
      "error",
      "Please add or activate at least One contractor to add new job"
    );
    return res.redirect("/contractor/index");
  }

  res.render("job/create", {
    formData: {},
    validateError: {},
    contractors,
  });
};

module.exports.createPost = async (req, res, next) => {
  const { jobNumber, jobDate, location, jobSize, contractorId } = req.body;
  const { companyId, _id } = req.user;
  const { unitPriceRate } = await Contractor.findOne({
    username: _id,
    companyId,
  }).select("unitPriceRate");

  const newJob = new Job({
    jobNumber,
    jobDate,
    jobSize,
    location,
    contractorDetails: {
      contractor: contractorId,
      unitPriceRate,
    },
    companyId,
    username: _id,
    invoice: {
      invoiceNumber: Math.floor(1000 + Math.random() * 9000),
      IsPaid: false,
    },
  });
  const newjob = await newJob.save();
  req.flash("success", "Job has been added successfully");
  return res.redirect(`/job/view/${newjob._id}/${newjob.companyId}`);
};

module.exports.job = async (req, res, next) => {
  const { id, company } = req.params;
  const { _id } = req.user;

  const job = await Job.findOne({
    companyId: company,
    _id: id,
    username: _id,
  })
    .populate("companyId")
    .populate({
      path: "contractorDetails.contractor",
      select: "conName conAddress",
    });

  const { jobSize, contractorDetails, additionalCharges } = job;

  //unit rate price get it from contractor collection (this price save at the time job creation)
  const { unitPriceRate } = contractorDetails;

  const add_charges = additionalCharges.reduce(
    (total, val) => total + val.charges,
    0
  );

  const jobCharges = jobSize * unitPriceRate;
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

module.exports.edit = async (req, res, next) => {
  const { id } = req.params;
  const { _id, companyId } = req.user;

  const contractors = await Contractor.find({ username: _id, companyId });
  const jobData = await Job.findOne({ _id: id, username: _id });

  res.render("job/jobEdit", {
    jobData,
    validateError: {},
    contractors,
  });
};

module.exports.update = async (req, res, next) => {
  const { value, error } = jobValidation.validate(req.body);
  const {
    charges,
    jobNumber,
    jobDate,
    location,
    jobSize,
    contractorId,
    Comment,
  } = req.body;
  const { companyId } = res.locals.currentUser;
  const { id } = req.params;
  const { _id } = req.user;

  const jobData = await Job.findOne({ _id: id, username: _id });

  //get selected contractor details and process to save the informmation
  //and check if the value changed for contract than only request to DB
  if (!jobData.contractorDetails.contractor.equals(contractorId)) {
    const { unitPriceRate } = await Contractor.findOne({
      username: _id,
      _id: contractorId,
    }).select("unitPriceRate");
    jobData.contractorDetails = {
      contractor: contractorId,
      unitPriceRate: unitPriceRate,
    };
  }

  if (error) {
    return res.render("job/jobEdit", {
      jobData,
      validateError: error.details[0].message,
    });
  }
  //edit and update array of extra expense to the job
  const updatedCharges = jobData.additionalCharges.filter((item) => {
    if (!charges) {
      return null;
    }
    return charges.includes(item._id);
  });

  jobData.jobNumber = jobNumber;
  jobData.jobDate = jobDate;
  jobData.location = location;
  jobData.jobSize = jobSize;
  jobData.additionalCharges = updatedCharges;
  jobData.comment = Comment;

  await jobData.save();
  req.flash("success", "Job has been updated successfully");
  //create link to redirect back to the view page
  return res.redirect(`/job/view/${id}/${companyId}`);
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

//remove the job details
module.exports.deleteJob = async (req, res, next) => {
  const { jobId } = req.body;
  const { _id, companyId } = req.user;

  const job = await Job.deleteOne({ _id: jobId, username: _id, companyId });
  if (!job) {
    return next("Bad request sent to the server");
  }
  req.flash("success", "Job details removed successfully");
  return res.redirect("/job/index");
};

module.exports.genrateInvoice = async (req, res, next) => {
  //genrate invoice code create new page where you can see proper invoice
  const { jobId } = req.params;
  const { _id } = req.user;
  const job = await Job.findOne({
    _id: jobId,
    username: _id,
  })
    .populate("companyId")
    .populate({
      path: "contractorDetails.contractor",
      select: "conName conAddress",
    });

  const { jobSize, contractorDetails, additionalCharges } = job;

  //unit rate price get it from contractor collection (this price save at the time job creation)
  const { unitPriceRate } = contractorDetails;

  const add_charges = additionalCharges.reduce(
    (total, val) => total + val.charges,
    0
  );

  const jobCharges = jobSize * unitPriceRate;
  const subtotal = jobCharges + add_charges;
  const GST = subtotal * 0.1;
  const totalInvoice = subtotal + GST;

  const InvoiceData = {
    job,
    jobCharges,
    GST,
    totalInvoice,
    subtotal,
  };
  return res.render("invoices/invoice", { InvoiceData });
};

const InvoiceTemplate = (InvoiceData) => {
  const { jobNumber, jobDate, location, jobSize, invoice, createdAt } =
    InvoiceData.job;
  const { contractor, unitPriceRate } = InvoiceData.job.contractorDetails;
  const { companyName, address, bankDetails } = InvoiceData.job.companyId;
  const { street, suburb, postCode } = address;
  const { ABN_number } = bankDetails;
  var add_charges = "";
};

//get payment done and job completed
module.exports.invoicePaid = async (req, res, next) => {
  const { jobId } = req.body;
  const { _id, companyId } = req.user;

  const job = await Job.findOne({ _id: jobId, username: _id, companyId });

  //toggle the invoice status fn
  job.invoice.IsPaid = job.invoice.IsPaid ? false : true;
  job.invoice.invoicePaidDate = new Date();

  await job.save();
  req.flash("success", "job payment status has been updated");
  return res.redirect("/job/index");
};
