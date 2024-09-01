const PDFDocument = require("pdfkit");

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

doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight).stroke();
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
