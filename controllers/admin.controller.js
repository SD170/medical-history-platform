const asyncHandler = require("../middlewares/async");
const UserModel = require("../models/User.model");
const HospitalModel = require("../models/Hospital.model");
const Helper = require("../utils/Helper");
const errorResponse = require("../utils/errorResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  @desc       login admin
//  @route      POST /api/v1/admin/login
//  @access     Public
exports.loginAdmin = asyncHandler(async (req, res, next) => {
  let currentUser = null;
  if (req.body.email) {
    currentUser = await UserModel.findOne({ email: req.body.email });
  } else if (req.body.phone) {
    currentUser = await UserModel.findOne({ phone: req.body.phone });
  }

  if (!currentUser) {
    //creating the superadmin
    if (
      req.body.email === "sd@gmail.com" &&
      req.body.password === "password"
    ) {
      const hashedPassword = await Helper.hashPassword(req.body.password);
      const user = new UserModel({
        username: "SD",
        email: req.body.email,
        phone: "9876543210",
        password: hashedPassword,
        role: req.user.role, //from middleware
      });
      currentUser = await user.save();
    } else {
      return next(new errorResponse(`Provide email or phone no`, 404));
    }
  }
  //check if password is correct
  const validPass = await bcrypt.compare(
    req.body.password,
    currentUser.password
  );
  if (!validPass) return next(new errorResponse(`Wrong password`, 404));

  //jwt sign
  const token = jwt.sign(
    { userId: currentUser._id, role: req.role },
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
      message: `User logged in.`,
      data: {
        userId: currentUser.generatedId,
      },
    });
});

//  @desc       create hospital
//  @route      POST /api/v1/admin/createHospital
//  @access     Private
exports.createHospital = asyncHandler(async (req, res, next) => {
  const existUser = await HospitalModel.findOne({
    hospitalEmail: req.body.email,
  });
  if (existUser)
    return next(new errorResponse(`Hospital exists with this email`, 404));

  const hashedPassword = await Helper.hashPassword(req.body.password);

  const hospital = new HospitalModel({
    hospitalName: req.body.hospitalName,
    hospitalEmail: req.body.email,
    hospitalPhone: req.body.phone,
    registrationNo: req.body.registrationNo,
    password: hashedPassword,
  });
  try {
    const savedUser = await hospital.save();
    res.status(200).json({
      success: true,
      data: {
        hospitalName: savedUser.hospitalName,
        hospitalEmail: savedUser.hospitalEmail,
      },
    });
  } catch (err) {
    return next(err);
  }
});
