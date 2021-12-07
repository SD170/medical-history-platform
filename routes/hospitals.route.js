const router = require("express").Router();
const { listUsers, getUser } = require("../controllers/user.controller");
const {
  createStuff,
  loginHospital,
  hospitalDetail,
} = require("../controllers/hospital.controller");

const { authenticate, checkIfLevel1 } = require("../middlewares/permissions");

const {
  generatedIdManagerParams,
  specifyHospitalInQuery,
} = require("../middlewares/generalMiddlewares");

router.route("/login").post(loginHospital);
router.use(authenticate, checkIfLevel1);
router.route("/createStuff").post(createStuff);
router.route("/hospitalDetail").get(hospitalDetail);

router.route("/listStuffs").get(specifyHospitalInQuery, listUsers);
router.route("/listStuffs/:userId").get(generatedIdManagerParams, getUser);

module.exports = router;
