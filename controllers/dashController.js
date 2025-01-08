const User = require("../models/user");

module.exports.index = async (req, res, next) => {
  return res.render("dashboard/index.ejs");
};

module.exports.signup = async (req, res, next) => {
  return res.render("dashboard/signup.ejs", {
    formData: {},
    validateError: {},
  });
};

module.exports.signupsubmit = async (req, res, next) => {
  const { fullname, email, contact, username, password, subscriptionExpireOn } =
    req.body;

  let newuser = new User({
    username: username.toLowerCase(),

    fullname: fullname,
    image:
      "https://www.pngitem.com/pimgs/m/581-5813504_avatar-dummy-png-transparent-png.png",
    isactive: true,
    subscriptionExpireOn,
    email: email,
    contactNumber: contact,
    role: "admin",
  });
  await User.register(newuser, password);
  req.flash("success", "New user has been registerd successfully!");
  return res.redirect("/dashboard/");
};

module.exports.users = async (req, res, next) => {
  const rows = 1;
  const users = await User.find({ role: "admin" });

  return res.render("dashboard/userList", { users, rows });
};
