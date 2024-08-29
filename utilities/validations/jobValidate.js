const Joi = require("joi");
const asyncWrap = require("../asyncWrap");

const jobValidation = Joi.object({
  jobNumber: Joi.string().required().min(3).max(6),
  jobDate: Joi.date().min("now").required().messages({
    "date.min": "Date cannot be in the past",
    "any.required": "Date is required",
  }),
  location: Joi.required(),
  jobSize: Joi.number().required(),
});

module.exports.isJobDataValid = asyncWrap(async (req, res, next) => {
  const { value, error } = jobValidation.validate(req.body);

  if (error) {
    const validateError = error.details[0].message;
    return res.render("job/create", {
      formData: value,
      validateError,
    });
  }

  next();
});
