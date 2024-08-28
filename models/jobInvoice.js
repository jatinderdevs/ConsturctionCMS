const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    IsPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "job",
    },
    username: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("jobinvoice", invoiceSchema);
