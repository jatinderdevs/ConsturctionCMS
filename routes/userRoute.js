const express = require("express");

const router = express.Router();
const controller = require("../controllers/userController");

router.get("/signup", controller.signup);

router.get("/signin", controller.signin);

module.exports = router;
