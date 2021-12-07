const asyncHandler = require("../middlewares/async");
const UserModel = require("../models/User.model");
const Helper = require("../utils/Helper");
const errorResponse = require("../utils/errorResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  @desc       create single user
//  @route      POST /api/v1/users/register
//  @access     Public
exports.createUser = asyncHandler(async (req, res, next) => {
  const existUser = await UserModel.findOne({ email: req.body.email });
  if (existUser)
    return next(new errorResponse(`User exists with this email`, 404));

  const hashedPassword = await Helper.hashPassword(req.body.password);

  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    password: hashedPassword,
    role: req.user ? req.user.role : req.role, //from middleware
  });
  try {
    const savedUser = await user.save();
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

//  @desc       login user
//  @route      POST /api/v1/users/login
//  @access     Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  let currentUser = null;
  if (req.body.email) {
    currentUser = await UserModel.findOne({ email: req.body.email });
  } else if (req.body.phone) {
    currentUser = await UserModel.findOne({ phone: req.body.phone });
  }

  if (!currentUser)
    return next(new errorResponse(`Provide email or phone no`, 404));
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

//  @desc       user detail
//  @route      GET /api/v1/users/userDetail
//  @access     Private
exports.userDetail = asyncHandler(async (req, res, next) => {
  const userId = req.query.userId || req.user.userId;
  const user = await UserModel.findById(userId).select("-password -_id");
  if (!user) return next(new errorResponse(`No user with this id`, 404));
  res.status(200).json({
    success: true,
    data: { user },
  });
});

//  @desc       list user
//  @route      POST /api/v1/user/
//  @access     Private
exports.listUsers = asyncHandler(async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude like select, sort etc
    const removeFields = ["select", "sort", "page", "limit"];

    // Delete removeFields from query
    removeFields.forEach((field) => delete reqQuery[field]);

    // Copy query string [so we can use replace]
    let queryString = JSON.stringify(reqQuery);

    // Create operators ($gt, $lt, $lte etc)
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    //finding resource
    query = UserModel.find(JSON.parse(queryString));

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await UserModel.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const users = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: pagination,
      data: { users },
    });
  } catch (err) {
    return next(err);
  }
});

//  @desc       get a single detail
//  @route      POST /api/v1/user/:userId
//  @access     Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.params.userId).select(
    "username email phone generatedId -_id"
  );

  res.status(200).json({
    success: true,
    data: { user },
  });
});
