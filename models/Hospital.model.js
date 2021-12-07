const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const options = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const HospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: [true, "Please add a name"],
  },
  hospitalEmail: {
    type: String,
    unique: true,
    required: [true, "Please add an email"],
  },
  hospitalPhone: {
    type: String,
    // unique: true,
    required: [true, "Please add a phone no"],
  },
  password: {
    type: String,
    required: true,
  },
  registrationNo: {
    type: String,
  },
  stuffs: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HospitalModel = mongoose.model("Hospital", HospitalSchema);

module.exports = HospitalModel;
