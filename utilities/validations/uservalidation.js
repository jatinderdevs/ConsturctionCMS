const Joi = require("joi");
const asyncWrap = require("../asyncWrap");

const userschema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  contact: Joi.string().required(),
  subscriptionExpireOn: Joi.date().required(),
  username: Joi.string().min(3).max(8).required(),
  password: Joi.string().min(3).max(10).required(),
});

module.exports.isUserValidate = asyncWrap(async (req, res, next) => {
  const { value, error } = userschema.validate(req.body);

  if (error) {
    const validateError = error.details[0].message;
    return res.render("dashboard/signup.ejs", {
      formData: value,
      validateError,
    });
  }

  next();
});
