const errorResponse = require("../utils/errorResponse");
//models
const UserModel = require("../models/User.model");

exports.generatedIdManager = async (req, res, next) => {
  if (req.body.userId || req.query.userId) {
    const currentUser = await UserModel.findOne({
      generatedId: req.body.userId || req.query.userId,
    });
    if (!currentUser) return next(new errorResponse(`Wrong userId`));
    req.body.userId = req.body.userId ? currentUser._id : undefined;
    req.query.userId = req.query.userId ? currentUser._id : undefined;
    next();
  } else {
    next();
  }
};

exports.generatedIdManagerParams = async (req, res, next) => {
  if (req.params.userId) {
    const currentUser = await UserModel.findOne({
      generatedId: req.params.userId,
    });

    if (!currentUser) return next(new errorResponse(`Wrong userId`));
    req.params.userId = req.params.userId ? currentUser._id : undefined;
    next();
  } else {
    next();
  }
};

exports.specifyHospitalInQuery = (req, res, next) => {
  if (!req.user.userId) {
    return next(new errorResponse(`not logged in as hospital`));
  }
  req.query.workingHospital = req.user.userId;
  next();
};
