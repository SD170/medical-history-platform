const asyncHandler = require("../middlewares/async");
const UserModel = require("../models/User.model");
const HospitalModel = require("../models/Hospital.model");
const Helper = require("../utils/Helper");
const errorResponse = require("../utils/errorResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ROLE } = require("../utils/roleList");

//  @desc       login hospital
//  @route      POST /api/v1/hospital/login
//  @access     Public
exports.loginHospital = asyncHandler(async (req, res, next) => {
  let hospital = null;
  if (req.body.email) {
    hospital = await HospitalModel.findOne({ email: req.body.email });
  } else if (req.body.phone) {
    hospital = await HospitalModel.findOne({ phone: req.body.phone });
  }

  if (!hospital) {
    return next(new errorResponse(`Provide email or phone no`, 404));
  }
  //check if password is correct
  const validPass = await bcrypt.compare(req.body.password, hospital.password);
  if (!validPass) return next(new errorResponse(`Wrong password`, 404));

  //jwt sign
  const token = jwt.sign(
    { userId: hospital._id, role: ROLE.LEVEL1 },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "365d",
    }
  );

  res
    .status(200)
    .header("Authorization", `jwt ${token}`)
    .json({
      success: true,
      message: `Hospital logged in.`,
      data: {
        userId: hospital._id,
      },
    });
});

//  @desc       create stuffs
//  @route      POST /api/v1/hosfital/createStuff
//  @access     Private
exports.createStuff = asyncHandler(async (req, res, next) => {
  const existUser = await UserModel.findOne({ email: req.body.email });
  if (existUser)
    return next(new errorResponse(`Stuff exists with this email`, 404));

  const hashedPassword = await Helper.hashPassword(req.body.password);

  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    password: hashedPassword,
    role: ROLE.LEVEL2,
    workingHospital: req.user.userId, //from authenticate middleware
  });
  try {
    const savedUser = await user.save();

    //adding stuffId to hospital model
    await HospitalModel.findByIdAndUpdate(req.user.userId, {
      $push: {
        stuffs: savedUser._id,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        username: savedUser.username,
        generatedId: savedUser.generatedId,
      },
    });
  } catch (err) {
    return next(err);
  }
});

//  @desc       hospital detail
//  @route      GET /api/v1/users/userDetail
//  @access     Private
exports.hospitalDetail = asyncHandler(async (req, res, next) => {
  const hospital = await HospitalModel.findById(req.user.userId).select(
    "-password -_id"
  );
  if (!hospital)
    return next(new errorResponse(`No hospital with this id`, 404));
  res.status(200).json({
    success: true,
    data: { hospital },
  });
});
