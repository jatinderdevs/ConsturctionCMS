const User = require("../models/user");

module.exports.user = async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findOne({ _id: userId }).populate({
    path: "companyId",
  });

  return res.render("userManagement/user.ejs", { user });
};

module.exports.userMembership = async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findOne({ _id: userId });
  return res.render("userManagement/userMembership.ejs", { user });
};

module.exports.updateMembership = async (req, res, next) => {
  const userId = req.params.userId;
  const { isactive, expiryDate } = req.body;
  const user = await User.findOne({ _id: userId });
  user.isactive = isactive;
  user.subscriptionExpireOn = expiryDate;
  await user.save();
  req.flash("success", "User Membership details has been updated");
  const url = `/usermanagement/${user._id}`;
  return res.redirect(url);
};
