const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model");
const HospitalModel = require("../models/Hospital.model");
const errorResponse = require("../utils/errorResponse");
const { ROLE } = require("../utils/roleList");

exports.authenticate = (req, res, next) => {
  const AuthorizationHeader = req.header("Authorization");
  if (!AuthorizationHeader) {
    next(new errorResponse(`Access Denied`, 401));
  }

  try {
    const token = AuthorizationHeader.split(" ")[1];
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    next(new errorResponse(`Invalid Token`, 401));
  }
};
exports.checkIfAdmin = async (req, res, next) => {
  if (req.user.role !== ROLE.ADMIN)
    next(new errorResponse(`User role is not ADMIN`, 401));
  try {
    const adminUser = await UserModel.findOne({
      _id: req.user.userId || req.query.userId || req.body.userId,
      role: req.user.role,
    });

    if (!adminUser)
      return next(new errorResponse(`No admin with this id`, 401));

    next();
  } catch (err) {
    next(new errorResponse(`Error finding admin`, 401));
  }
};

exports.checkIfLevel1 = async (req, res, next) => {
  if (req.user.role !== ROLE.LEVEL1)
    next(new errorResponse(`User role is not ${ROLE.LEVEL1}`, 401));
  try {
    const hospital = await HospitalModel.findOne({
      _id: req.user.userId || req.query.userId || req.body.userId,
      role: req.user.role,
    });

    if (!hospital)
      return next(new errorResponse(`No ${ROLE.LEVEL1} with this id`, 401));

    next();
  } catch (err) {
    next(new errorResponse(`Error finding ${ROLE.LEVEL1}`, 401));
  }
};
exports.checkIfLevel2 = async (req, res, next) => {
  if (req.user.role !== ROLE.LEVEL2)
    next(new errorResponse(`User role is not ${ROLE.LEVEL2}`, 401));
  try {
    const hospital = await UserModel.findOne({
      _id: req.user.userId || req.query.userId || req.body.userId,
      role: req.user.role,
    });

    if (!hospital)
      return next(new errorResponse(`No ${ROLE.LEVEL2} with this id`, 401));

    next();
  } catch (err) {
    next(new errorResponse(`Error finding ${ROLE.LEVEL2}`, 401));
  }
};

exports.setLevel3Role = (req, res, next) => {
  req.role = ROLE.LEVEL3;
  next();
};

exports.setLevel2Role = (req, res, next) => {
  req.role = ROLE.LEVEL2;
  next();
};
exports.setAdminRole = (req, res, next) => {
  req.role = ROLE.ADMIN;
  next();
};

// module.exports = { authenticate: authenticate };
