const express = require("express");
const app = express();
const mongoose = require("mongoose");

app.use("/", (req, res, next) => {
  res.json(" app has been started welcome to the app");
});

app.listen(3000, (err) => {
  console.log(err);
  mongoose.connect("mongodb://localhost:27017/cms_db");
});
