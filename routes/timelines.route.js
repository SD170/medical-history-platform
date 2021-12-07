const router = require("express").Router();

const {
  createTimeline,
  createTimelineFileUpload,
  userTimelineHistory,
} = require("../controllers/timeline.controller");

const { authenticate } = require("../middlewares/permissions");
const {
  generatedIdManagerParams,
} = require("../middlewares/generalMiddlewares");

const { multerUpload } = require("../middlewares/fileUpload");

// router.route("/login").post(loginHospital);
router.use(authenticate);
router
  .route("/createTimeline/:userId")
  .post(generatedIdManagerParams, createTimeline);
router
  .route("/createTimelineFileUpload/:timelineId")
  .post(multerUpload, createTimelineFileUpload);
router.route("/userTimelineHistory").get(userTimelineHistory);

module.exports = router;
