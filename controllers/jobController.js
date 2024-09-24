const Company = require("../models/company");
const Contractor = require("../models/contractor");
const Job = require("../models/Jobs");
const { jobValidation } = require("../utilities/validations/jobValidate");
const HTMLToPDF = require("convert-html-to-pdf").default;

const axios = require("axios");

module.exports.index = async (req, res, next) => {
  const rows = 1;
  const { companyId } = req.user;
  const jobs = await Job.find({ companyId: companyId });
  res.render("job/index", { jobs, rows });
};

module.exports.create = async (req, res, next) => {
  const { _id, companyId } = req.user;
  const contractors = await Contractor.find({ username: _id, companyId });
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
  const { charges, jobNumber, jobDate, location, jobSize, contractorId } =
    req.body;
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

  const htmlToPDF = new HTMLToPDF(InvoiceTemplate(InvoiceData));

  htmlToPDF
    .convert()
    .then((buffer) => {
      // do something with the PDF file buffer
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="invoice.pdf"');

      // Send the buffer as the response
      res.send(buffer);
    })
    .catch((err) => {
      // do something on error
    });
};

const InvoiceTemplate = (InvoiceData) => {
  var add_charges = "";
  for (let charges of InvoiceData.job.additionalCharges) {
    add_charges += `<tr>
        <td></td>
        <td></td>
        <td><strong>${charges.chargeInfo}</strong></td>
        <td>${charges.charges.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}</td>
    </tr>`;
  }
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
        integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
    <link rel="stylesheet" href="/css/stylesheet.css">
</head>

<body>
   
    <main>
        <div class="container">
            
<section>
<div class="row">
  <div class="col-md-8">
  </div>
  <div class="col-md-4">
   <h3>${InvoiceData.job.contractorDetails.contractor.conName}</h3>
    <p>
    ${InvoiceData.job.contractorDetails.contractor.conAddress}
    </p>
  </div>

</div>
   
    <hr/>
    <table class="table table-bordered text-capitalize mt-4">
    <thead class="alert alert-primary ">
        <tr class="">
            <th>Descripation</th>
            <th>area (Sqm)</th>
            <th>unit price</th>
            <th>total price AUD</th>

        </tr>
    </thead>
    <tbody>
        <tr>
            <td>houseslable</td>
            <td>${InvoiceData.job.jobSize}</td>
            <td>${InvoiceData.job.contractorDetails.unitPriceRate.toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: "USD",
              }
            )}
            </td>
            <td>${InvoiceData.jobCharges.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}</td>

            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
           ${add_charges}
              
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr class="alert alert-dark">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td><strong>Subtotal:</strong></td>
                <td>${InvoiceData.subtotal.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}</td>

            </tr>
            <tr>
                <td></td>
                <td><strong>GST</strong></td>
                <td><strong>10%</strong></td>

                <td>${InvoiceData.GST.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}</td>

            </tr>
            <tr>
                <td></td>
                <td></td>
                <td><strong>Grand Total</strong></td>

                <td>${InvoiceData.totalInvoice.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}</td>

            </tr>
            </tbody>
            </table>
        </div>
</section>
<section>
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title alert alert-primary" id="exampleModalLabel">Additional Charges</h5>
                    <button type="button" class="close btn btn-outline-danger" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="/job/charges/" method="post" novalidate class="needs-validation">
                        <input type="hidden" name="jobId" value="66e6b61cb8f1819b9ffd5181">
                        <input type="hidden" name="companyId" value="66e6743e33e80742a181a4ac">
                        <div class="form-group">
                            <label for="chargesInfo">Charges Info</label>
                            <input type="text" class="form-control" id="chargesInfo" name="chargesInfo" required
                                aria-describedby="emailHelp">
                            <div class="invalid-feedback">
                                Please provide a Charges Details
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="charges">charges</label>
                            <div class="input-group mb-2 mr-sm-2">
                                <div class="input-group-prepend">
                                    <div class="input-group-text">$</div>
                                </div>
                                <input type="number" required class="form-control" id="charges" name="charges"
                                    placeholder="charges">
                                <div class="invalid-feedback">
                                    Provide charges value
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <button type="submit" class="btn btn-primary">Update</button>

                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
</section>
<script>
    var element = document.getElementById('test');
    var options = {
        filename: 'test.pdf'
    };
    domToPdf(element, options, function (pdf) {
        console.log('done');
    });
</script>

            </div>
            </main>
            <footer class="text-center bg-light">
                <p>&copy; All rights are reserved</p>
            </footer>
</body>


</html>`;
};
