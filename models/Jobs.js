const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema(
  {
    jobNumber: {
      type: String,
      required: true,
    },
    jobDate: {
      type: Date,
      required: true,
      //can be set default today's date
    },
    jobSize: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    unitRate: {
      type: Number,
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "company",
    },
    comment: String,
    username: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("job", jobSchema);