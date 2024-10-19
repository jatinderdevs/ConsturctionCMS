const Company = require("../models/company");
const Contractor = require("../models/contractor");
const Job = require("../models/Jobs");
const { jobValidation } = require("../utilities/validations/jobValidate");
const HTMLToPDF = require("convert-html-to-pdf").default;
const PDFDocument = require("pdfkit");

const axios = require("axios");

module.exports.index = async (req, res, next) => {
  const rows = 1;
  const { companyId } = req.user;
  const jobs = await Job.find({ companyId: companyId });
  res.render("job/index", { jobs, rows });
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
  const invoiceData = {
    invoiceNumber: "73",
    invoiceDate: "July 31st, 2024",
    companyName: "EDIFIC DEVELOPERS PTY LTD",
    companyAddress: "1 Phoenix Cct, Brookfield, VIC, 3338",
    abn: "40442831848",
    to: "CORMACK CONCRETING",
    toAddress: "9 Boneyards Ave, Torquay VIC 3228",
    jobLocation: "Lot 1606 Razor Back Crescent Wollert, VIC, 3750",
    jobNumber: "01573V",
    jobDate: "July 26, 2024",
    items: [
      {
        description: "House Slabs",
        area: "186.57",
        unitPrice: "20.00",
        totalPrice: "3731.40",
      },
      {
        description: "6 Pier Jack Hammer",
        area: "",
        unitPrice: "200.00",
        totalPrice: "200.00",
      },
    ],
    subtotal: "3931.40",
    gst: "393.14",
    total: "4324.54",
    bankDetails: {
      accountName: "EDIFIC DEVELOPERS PTY LTD",
      bsb: "063994",
      accountNumber: "10297078",
    },
  };

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice_${invoiceData.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  // Fonts and general styling
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("INVOICE", { align: "center" })
    .moveDown();
  doc.fontSize(12);

  doc
    .text(`INVOICE DATE: ${invoiceData.invoiceDate}`, { align: "left" })
    .text(`INVOICE NO: ${invoiceData.invoiceNumber}`, { align: "left" })
    .moveDown();

  doc
    .text(invoiceData.companyName, { align: "left" })
    .text(`Address: ${invoiceData.companyAddress}`, { align: "left" })
    .text(`ABN: ${invoiceData.abn}`, { align: "left" })
    .moveDown();

  doc
    .text(`To: ${invoiceData.to}`, { align: "left" })
    .text(invoiceData.toAddress, { align: "left" })
    .moveDown();

  doc
    .text(`Job Location: ${invoiceData.jobLocation}`, { align: "left" })
    .text(`Job Number: ${invoiceData.jobNumber}`, { align: "left" })
    .text(`Job Date: ${invoiceData.jobDate}`, { align: "left" })
    .moveDown();

  // Line separator
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

  // Table header with borders
  const startX = 50;
  const startY = doc.y;
  const columnWidths = [200, 100, 100, 100];
  const rowHeight = 20;

  // Draw header row
  doc.rect(startX, startY, columnWidths[0], rowHeight).stroke();
  doc.text("Description", startX + 5, startY + 5, {
    width: columnWidths[0] - 10,
    align: "left",
  });

  doc
    .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
    .stroke();
  doc.text("Area (Sqm)", startX + columnWidths[0] + 5, startY + 5, {
    width: columnWidths[1] - 10,
    align: "center",
  });

  doc
    .rect(
      startX + columnWidths[0] + columnWidths[1],
      startY,
      columnWidths[2],
      rowHeight
    )
    .stroke();
  doc.text(
    "Unit Price",
    startX + columnWidths[0] + columnWidths[1] + 5,
    startY + 5,
    { width: columnWidths[2] - 10, align: "center" }
  );

  doc
    .rect(
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      startY,
      columnWidths[3],
      rowHeight
    )
    .stroke();
  doc.text(
    "Total Price AUD",
    startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
    startY + 5,
    { width: columnWidths[3] - 10, align: "center" }
  );

  doc.moveDown();

  // Table rows with borders
  let currentY = startY + rowHeight;
  doc.font("Helvetica");
  invoiceData.items.forEach((item) => {
    doc.rect(startX, currentY, columnWidths[0], rowHeight).stroke();
    doc.text(item.description, startX + 5, currentY + 5, {
      width: columnWidths[0] - 10,
      align: "left",
    });

    doc
      .rect(startX + columnWidths[0], currentY, columnWidths[1], rowHeight)
      .stroke();
    doc.text(item.area, startX + columnWidths[0] + 5, currentY + 5, {
      width: columnWidths[1] - 10,
      align: "center",
    });

    doc
      .rect(
        startX + columnWidths[0] + columnWidths[1],
        currentY,
        columnWidths[2],
        rowHeight
      )
      .stroke();
    doc.text(
      item.unitPrice,
      startX + columnWidths[0] + columnWidths[1] + 5,
      currentY + 5,
      { width: columnWidths[2] - 10, align: "center" }
    );

    doc
      .rect(
        startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
        currentY,
        columnWidths[3],
        rowHeight
      )
      .stroke();
    doc.text(
      item.totalPrice,
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
      currentY + 5,
      { width: columnWidths[3] - 10, align: "center" }
    );

    currentY += rowHeight;
  });

  // Line separator after the table
  doc.moveTo(50, currentY).lineTo(550, currentY).stroke().moveDown();

  // Totals with right alignment
  doc
    .text(
      `Subtotal: $${invoiceData.subtotal}`,
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      currentY + 5,
      { align: "right" }
    )
    .text(
      `GST 10.00%: $${invoiceData.gst}`,
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      doc.y,
      { align: "right" }
    )
    .text(
      `TOTAL: $${invoiceData.total}`,
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      doc.y,
      { align: "right" }
    )
    .moveDown();

  // Bank details
  doc
    .text("Please pay the above amount to:", startX, doc.y)
    .text(`Account name: ${invoiceData.bankDetails.accountName}`, startX, doc.y)
    .text(`BSB: ${invoiceData.bankDetails.bsb}`, startX, doc.y)
    .text(`Acc. No: ${invoiceData.bankDetails.accountNumber}`, startX, doc.y);

  doc.end();
  return false;
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
  const invoiceName = `Invoice_${job.jobNumber}.pdf`;
  const htmlToPDF = new HTMLToPDF(InvoiceTemplate(InvoiceData));

  htmlToPDF
    .convert()
    .then((buffer) => {
      // do something with the PDF file buffer
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
      // attachment
      //inline
      // Send the buffer as the response
      return res.send(buffer);
    })
    .catch((err) => {
      // do something on error
      next();
    });
};

const InvoiceTemplate = (InvoiceData) => {
  const { jobNumber, jobDate, location, jobSize, invoice, createdAt } =
    InvoiceData.job;
  const { contractor, unitPriceRate } = InvoiceData.job.contractorDetails;
  const { companyName, address, bankDetails } = InvoiceData.job.companyId;
  const { street, suburb, postCode } = address;
  const { ABN_number } = bankDetails;
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
    <style>
    p{
    font-size:18px;
    }
    main{
    padding:0 10px;
  border:1px solid #dfdfdf;
  margin:0 5px;
    }
   
    </style>
</head>

<body>
    <div  class="bg-warning p-2 text-center">
    <h2>INVOICE</h2>
    </div>
    <main>
    
   

    <section class="py-4"></section>
    <section>
        <div class="containedr">
        <div class="row">

  <div class="col-md-6">
  </div>
  <div class="col-md-6 text-right">
   <h1>${companyName}</h1>
   <p>
   
    ${street},${suburb},${postCode}
  
  
   </p>
     
     <p>ABN:<strong> ${ABN_number}</strong></p>
  </div>

</div>
            

     <br/>

<div class="row">

  <div class="col-md-7">
  </div>
  <div class="col-md-5 text-right">
   <h3>Invoice Details</h3>
    <p>
   Invoice Date: <strong>${createdAt.toLocaleDateString(undefined, {
     weekday: "long",
     year: "numeric",
     month: "long",
     day: "numeric",
   })}</strong>
    </p>
     <p>
   Invoice Number: <strong>${invoice.invoiceNumber}</strong>
    </p>
  </div>

</div>
<hr/>
   <div class="row">

 
  <div class="col-md-4">
    <h4>To</h4>
   <h3 class="text-capitalize">${contractor.conName}</h3>
    <p>
    ${contractor.conAddress}
    </p>
  </div>
 <div class="col-md-8">
  </div>
</div>
 <div class="row">

 
  <div class="col-md-5">
  <p>Job Location:<strong>${location}</strong></p>
  <p>Job Number:<strong class="">${jobNumber}</strong></p>
  <p>Job Date:<strong>${jobDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}</strong></p>

  </div>
 <div class="col-md-7">
  </div>
</div>
    <hr/>
    <table class="table table-bordered text-capitalize my-4 ">
    <thead  class="alert alert-primary ">
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
            <td>${jobSize}</td>
            <td>${unitPriceRate.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
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

                <td><strong> ${InvoiceData.totalInvoice.toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "USD",
                  }
                )}</strong></td>

            </tr>
            </tbody>
            </table>
        </div>
        <br/>
        <strong class="h5">Please pay the above amount to:</strong>
        <hr/>
        <div class="row">

 
  <div class="col-md-4">
    
   <h3>${bankDetails.bankName}</h3>

    <p class="m-0"> BSB: <strong>${bankDetails.BSB}</strong>    </p>
    <p> Account Number: <strong>${bankDetails.accountNumber}</strong>    </p>

  </div>
 <div class="col-md-8">
  </div>
</div>
</section>
<section class="py-4"></section>

            </div>
             </main>
            <footer class="text-center bg-warning p-2">
                <p class="m-0">Powered by Construction Management System (CMS)</p>
            </footer>
           
</body>


</html>`;
};

//get payment done and job completed
module.exports.invoicePaid = async (req, res, next) => {
  const { jobId } = req.body;
  const { _id, companyId } = req.user;

  const job = await Job.findOne({ _id: jobId, username: _id, companyId });

  //toggle the invoice status fn
  job.invoice.IsPaid = job.invoice.IsPaid ? false : true;

  await job.save();
  req.flash("success", "job payment status has been updated");
  return res.redirect("/job/index");
};
