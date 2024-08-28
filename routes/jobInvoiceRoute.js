const express = require("express");
const asyncWrap = require("../utilities/asyncWrap");
const { genrate, invoicePDF } = require("../controllers/jobInvoiceController");
const router = express.Router();

router.post("/genrate", asyncWrap(genrate));
router.get("/genratePDF", asyncWrap(invoicePDF));

module.exports = router;
