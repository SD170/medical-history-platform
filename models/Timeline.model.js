const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const options = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const TimelineSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  caseHospital: {
    //if timeline created by any hospital
    type: Schema.Types.ObjectId,
    ref: "Hospital",
  },
  doctorName: {
    //mention doctor's name if needed
    type: String,
  },
  threatLevel: {
    type: String,
    enum: ["normal", "moderate", "critical"],
    default: "normal",
  },
  typeOfCase: {
    //heart, kidney
    type: String,
  },
  detailOfCase: {
    //brief detail
    type: String,
  },
  testReports: [
    {
      type: String,
    },
  ],
  prescriptions: [
    {
      type: String,
    },
  ],
  surgery: {
    //case of surgery or not
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TimelineModel = mongoose.model("Timeline", TimelineSchema);

module.exports = TimelineModel;
