const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentsController");
const asyncWrap = require("../utilities/asyncWrap");

router.get("/", asyncWrap(controller.payments));

module.exports = router;
