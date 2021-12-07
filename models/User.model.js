const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { randomAlphNumString } = require("./utils");

// const options = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const UserSchema = new mongoose.Schema({
  generatedId: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Please add a name"],
    min: [6, `Name Can't be less than 6 charecters`],
    max: [50, `Name Can't be more than 50 charecters`],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please add an email"],
  },
  phone: {
    type: String,
    // unique: true,
    // required: [true, "Please add a phone no"],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: [true, "Please add a role"],
  },
  workingHospital: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
  },
  timelineHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Timeline",
    },
  ],
  medications: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", function (next) {
  const length = 10;
  this.generatedId = randomAlphNumString(length);
  next();
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
