const Joi = require("joi");
const asyncWrap = require("../asyncWrap");
const contractor = require("../../models/contractor");

module.exports.jobValidation = Joi.object({
  contractorId: Joi.string().optional().label("Contractor/job provider"),
  jobDate: Joi.date().required().messages({
    "any.required": "Date is required",
  }),
  jobNumber: Joi.string().required().min(3).max(6),
  location: Joi.string().required(),
  jobSize: Joi.number().required(),
  comment: Joi.optional(),
}).unknown(true);

module.exports.isJobDataValid = asyncWrap(async (req, res, next) => {
  const { value, error } = this.jobValidation.validate(req.body);
  const { _id, companyId } = req.user;
  const contractors = await contractor.find({ username: _id, companyId });

  if (error) {
    const validateError = error.details[0].message;
    return res.render("job/create", {
      formData: value,
      validateError,
      contractors,
    });
  }
  next();
});
