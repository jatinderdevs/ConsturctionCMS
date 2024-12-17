const express = require("express");
const router = express.Router();
const { user } = require("../controllers/userManagementController");

const asyncWrap = require("../utilities/asyncWrap");

router.route("/:userId").get(asyncWrap(user));

module.exports = router;
