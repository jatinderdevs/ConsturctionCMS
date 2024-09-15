const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contractorSchema = new Schema({
  conName: {
    type: String,
    required: true,
  },
  conAddress: {
    type: String,
    required: true,
  },
  conEmail: {
    type: String,
    required: true,
  },
  conPhone: {
    type: String,
  },
  isDeafult: {
    type: Boolean,
    default: false,
  },
  unitPriceRate: {
    type: Number,
    required: true,
  },
  username: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
});

contractorSchema.pre("findOneAndDelete", function (next) {
  const { _id, username } = this.getFilter();
  //here you can code for delete all the job realate to the specific contract
  next();
});

module.exports = mongoose.model("contractor", contractorSchema);
