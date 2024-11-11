const Company = require("../models/company");
const Contractor = require("../models/contractor");
const Job = require("../models/Jobs");
const { jobValidation } = require("../utilities/validations/jobValidate");

const PDFDocument = require("pdfkit");
const fs = require("fs");
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

  function createInvoice(data, path) {
    const doc = new PDFDocument();

    // Helper function for table rows
    function addTableRow(y, description, area, unitPrice, totalPrice) {
      doc
        .fontSize(10)
        .text(description, 50, y, { width: 180 })
        .text(area || "-", 240, y, { width: 60, align: "right" })
        .text(`$${unitPrice.toFixed(2)}`, 320, y, { width: 80, align: "right" })
        .text(`$${totalPrice.toFixed(2)}`, 420, y, {
          width: 80,
          align: "right",
        });
    }

    // Header Section
    doc
      .fontSize(18)
      .text("EDIFIC DEVELOPERS PTY LTD", { align: "center" })
      .moveDown()
      .fontSize(10)
      .text("Address: 1 Phoenix Cct, Brookfield, VIC, 3338", {
        align: "center",
      })
      .text("ABN: 40442831848", { align: "center" })
      .moveDown()
      .text(
        "_____________________________________________________________________________________",
        { align: "center" }
      )
      .moveDown(1.5);

    // Invoice Title
    doc.fontSize(20).text("INVOICE", { align: "center" }).moveDown();

    // Invoice and Client Details
    doc
      .fontSize(12)
      .text(`Invoice Date: ${data.invoiceDate}`, 50)
      .text(`Invoice No: ${data.invoiceNo}`, 450)
      .moveDown()
      .text("To:", 50)
      .text(`${data.clientName}`, 50)
      .text(`${data.clientAddress}`, 50)
      .moveDown()
      .text(`Job Location: ${data.jobLocation}`, 50)
      .text(`Job Number: ${data.jobNumber}`, 50)
      .text(`Job Date: ${data.jobDate}`, 50)
      .moveDown();

    // Draw table headers with centered text
    function drawTableHeaders(y) {
      doc
        .fontSize(12)
        .text("Description", 50, y, { width: columnWidths[0], align: "center" })
        .text("Area (Sqm)", 50 + columnWidths[0], y, {
          width: columnWidths[1],
          align: "center",
        })
        .text("Unit Price", 50 + columnWidths[0] + columnWidths[1], y, {
          width: columnWidths[2],
          align: "center",
        })
        .text(
          "Total Price AUD",
          50 + columnWidths[0] + columnWidths[1] + columnWidths[2],
          y,
          { width: columnWidths[3], align: "center" }
        );

      // Draw header borders
      drawRowBorders(y, columnWidths.reduce((a, b) => a + b, 0) + 50);
    }
    const tableTop = 400; // Start position of the table
    const rowHeight = 30; // Height of each row
    const columnWidths = [180, 80, 100, 100];
    // Draw each row of the table
    function drawTableRow(y, item) {
      doc
        .fontSize(10)
        .text(item.description, 50, y, {
          width: columnWidths[0],
          align: "center",
        })
        .text(item.area || "-", 50 + columnWidths[0], y, {
          width: columnWidths[1],
          align: "center",
        })
        .text(
          `$${item.unitPrice.toFixed(2)}`,
          50 + columnWidths[0] + columnWidths[1],
          y,
          { width: columnWidths[2], align: "center" }
        )
        .text(
          `$${item.totalPrice.toFixed(2)}`,
          50 + columnWidths[0] + columnWidths[1] + columnWidths[2],
          y,
          { width: columnWidths[3], align: "center" }
        );

      // Draw row borders
      drawRowBorders(y, columnWidths.reduce((a, b) => a + b, 0) + 50);
    }

    // Draw row borders
    function drawRowBorders(y, totalWidth) {
      doc
        .moveTo(50, y)
        .lineTo(50 + totalWidth, y)
        .stroke();

      doc
        .moveTo(50, y)
        .lineTo(50, y + rowHeight)
        .stroke();

      let xPos = 50;
      for (let width of columnWidths) {
        xPos += width;
        doc
          .moveTo(xPos, y)
          .lineTo(xPos, y + rowHeight)
          .stroke();
      }

      doc
        .moveTo(50, y + rowHeight)
        .lineTo(50 + totalWidth, y + rowHeight)
        .stroke();
    }
    drawTableHeaders(tableTop);

    let rowY = tableTop + rowHeight;
    data.items.forEach((item) => {
      drawTableRow(rowY, item);
      rowY += rowHeight;
    });

    // Totals Section
    doc
      .moveDown()
      .text("", { align: "left" })
      .moveDown()
      .fontSize(12)
      .text(`Subtotal: $${data.subtotal.toFixed(2)}`, 420, doc.y, {
        align: "right",
      })
      .text(`GST 10.00%: $${data.gst.toFixed(2)}`, 420, doc.y + 15, {
        align: "right",
      })
      .fontSize(14)
      .text(`TOTAL: $${data.total.toFixed(2)}`, 420, doc.y + 30, {
        align: "right",
      });

    // Payment Details
    doc
      .moveDown(2)
      .fontSize(12)
      .text("Please pay the above amount to:", { align: "left" })
      .text(`Account name: ${data.accountName}`, { align: "left" })
      .text(`BSB: ${data.bsb}`, { align: "left" })
      .text(`Acc. No: ${data.accountNumber}`, { align: "left" });

    // Finalize and save PDF
    doc.end();
    doc.pipe(fs.createWriteStream(path));
  }

  // Sample data
  function generateTableRow(
    doc,
    y,
    desc,
    area,
    unitPrice,
    totalPrice,
    isHeader = false
  ) {
    doc
      .fontSize(10)
      .font(isHeader ? "Helvetica-Bold" : "Helvetica")
      .text(desc, 50, y, { width: 150 })
      .text(area, 200, y, { width: 80, align: "right" })
      .text(unitPrice, 300, y, { width: 100, align: "right" })
      .text(totalPrice, 400, y, { width: 100, align: "right" });
  }

  // Sample data to test
  const invoiceData = {
    invoiceDate: "August 29th 2024",
    invoiceNo: "82",
    clientName: "CORMACK CONCRETING",
    clientAddress: "9 Boneyards Ave, Torquay VIC 3228",
    jobLocation: "Lot 5112, Rush Carescent, Manor Lakes, VIC, 3024",
    jobNumber: "215861",
    jobDate: "20th August 2024",
    items: [
      {
        description: "House Slabs",
        area: "268.34",
        unitPrice: 20.0,
        totalPrice: 5366.8,
      },
      {
        description: "High Bread Job (extra Labor)",
        area: "",
        unitPrice: 600.0,
        totalPrice: 600.0,
      },
      {
        description: "Able Flex (Legging)",
        area: "",
        unitPrice: 80.0,
        totalPrice: 80.0,
      },
    ],
    subtotal: 6046.8,
    gst: 604.68,
    total: 6651.48,
    accountName: "EDIFICE DEVELOPERS PTY LTD",
    bsb: "063994",
    accountNumber: "10297078",
  };

  // Generate PDF
  // createInvoice(invoiceData, "invoice.pdf");
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

  await job.save();
  req.flash("success", "job payment status has been updated");
  return res.redirect("/job/index");
};
