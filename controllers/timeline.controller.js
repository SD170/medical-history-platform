const asyncHandler = require("../middlewares/async");
const UserModel = require("../models/User.model");
const TimelineModel = require("../models/Timeline.model");
const errorResponse = require("../utils/errorResponse");
const { ROLE } = require("../utils/roleList");

//  @desc       create timeline
//  @route      POST /api/v1/timeline/createTimeline/:userId
//  @access     Private
exports.createTimeline = asyncHandler(async (req, res, next) => {
  if (!req.params.userId)
    return next(new errorResponse(`Please provide a userId in params`, 404));

  const timelineObject = {
    userId: req.params.userId,
    doctorName: req.body.doctorName,
    threatLevel: req.body.threatLevel ? req.body.threatLevel : undefined,
    typeOfCase: req.body.typeOfCase,
    detailOfCase: req.body.detailOfCase,
    surgery: req.body.surgery ? req.body.surgery : undefined,
    lastUpdateAt: Date.now(),
  };
  if (req.user.role === ROLE.LEVEL1 || req.user.role === ROLE.LEVEL2) {
    if (req.user.role === ROLE.LEVEL2) {
      const stuff = await UserModel.findById(req.user.userId);
      timelineObject.caseHospital = stuff.workingHospital;
    } else {
      timelineObject.caseHospital = req.user.userId;
    }
  }
  const timeline = new TimelineModel(timelineObject);

  const newTimeline = await timeline.save();

  const medications = req.body.medications;

  const updateQuery = {
    $push: {
      timelineHistory: { $each: [newTimeline._id], $position: 0 }, //pushing at top of the arr
    },
  };
  if (medications) {
    updateQuery["$addToSet"] = { medications };
  }

  const user = await UserModel.findByIdAndUpdate(
    req.params.userId,
    updateQuery
  );

  if (!user)
    return next(new errorResponse(`No user exists with the userId`, 404));

  res.status(200).json({
    success: true,
    message: `new history creted in ${user.username}'s timeline`,
    data: {
      timelineId: newTimeline._id,
    },
  });

  //add tiemline to user
});

//  @desc       create timeline
//  @route      POST /api/v1/timeline/createTimelineFileUpload/:timelineId
//  @access     Private
exports.createTimelineFileUpload = asyncHandler(async (req, res, next) => {
  if (!req.params.timelineId)
    return next(
      new errorResponse(`Please provide a timelineId in params`, 404)
    );

  const { files } = req;
  // testReports
  const testReports = files.testReports
    ? files.testReports.map((f) => f.filename)
    : undefined;
  // prescriptions
  const prescriptions = files.prescriptions
    ? files.prescriptions.map((f) => f.filename)
    : undefined;

  const newTimeline = await TimelineModel.findByIdAndUpdate(
    req.params.timelineId,
    {
      $push: {
        testReports: testReports,
        prescriptions: prescriptions,
      },
    }
  );

  if (!newTimeline)
    return next(new errorResponse(`Problem uploading files to timeline`, 404));

  res.status(200).json({
    success: true,
    message: `files uploaded`,
    data: {},
  });

  //add tiemline to user
});

//  @desc       timeline detail
//  @route      GET /api/v1/timeline/userTimelineHistory
//  @access     Private
exports.userTimelineHistory = asyncHandler(async (req, res, next) => {
  let userId;

  if (req.user.role === ROLE.LEVEL1 || req.user.role === ROLE.LEVEL2) {
    //requested by a stuff or hospital
    userId = req.body.userId;
  } else {
    // requested by a user
    userId = req.user.userId;
  }
  const timelineHistory = await UserModel.findById(userId)
    .select("timelineHistory")
    .populate("timelineHistory");
  if (!timelineHistory)
    return next(new errorResponse(`No timelineHistory with this id`, 404));
  res.status(200).json({
    success: true,
    data: { timeline: timelineHistory },
  });
});
