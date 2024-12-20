//this page can be used to redirect the home page with deafult link of the app

const express = require("express");
const router = express.Router();

const { signin } = require("../controllers/userController");

router.get("/", signin);

router.get("/test", (req, res, next) => {
  return res.render("test.ejs");
});

module.exports = router;
