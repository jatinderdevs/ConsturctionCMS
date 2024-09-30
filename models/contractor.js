const Jobs = require("./Jobs");
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
  isActive: {
    type: Boolean,
    default: true,
  },
});

// contractorSchema.pre("findOneAndDelete", async (req, res, next) => {
//   const { _id, username } = this.getFilter();
//   // const isdeleted = await Jobs.deleteMany({
//   //   "contractorDetails.contractor": _id,
//   //   username,
//   // });
//   // //here you can code for delete all the job realate to the specific contract
//   // if (!isdeleted) {
//   //   req.flash(
//   //     "error",
//   //     "something went wrong while deleting jobs related to this contractor"
//   //   );
//   // }
//   next();
// });

module.exports = mongoose.model("contractor", contractorSchema);
