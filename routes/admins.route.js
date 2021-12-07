const router = require("express").Router();
const { createUser, userDetail } = require("../controllers/user.controller");
const {
  loginAdmin,
  createHospital,
} = require("../controllers/admin.controller");

const {
  authenticate,
  setAdminRole,
  checkIfAdmin,
} = require("../middlewares/permissions");

router.route("/loginAdmin").post(setAdminRole, loginAdmin);
router.use(authenticate, checkIfAdmin);
router.route("/createAdmin").post(createUser);
router.route("/createHospital").post(createHospital);
router.route("/adminDetail").get(userDetail);

module.exports = router;
