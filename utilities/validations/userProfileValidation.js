const Joi = require("joi");
const asyncWrap = require("../asyncWrap");

const userProfileValidation = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  contactNumber: Joi.string().required(),
}).unknown(true);

module.exports.validateProfile = asyncWrap(async (req, res, next) => {
  const { value, error } = userProfileValidation.validate(req.body);

  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect("/user/profileupdate");
  }

  next();
});
