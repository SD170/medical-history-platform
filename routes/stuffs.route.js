const router = require("express").Router();
const {
  createUser,
  loginUser,
  userDetail,
  getUser,
} = require("../controllers/user.controller");

const {
  authenticate,
  checkIfLevel2,
  setLevel3Role,
  setLevel2Role,
} = require("../middlewares/permissions");

const {
  generatedIdManagerParams,
} = require("../middlewares/generalMiddlewares");

router.route("/login").post(setLevel2Role, loginUser);
router.use(authenticate, checkIfLevel2);
router.route("/createUser").post(setLevel3Role, createUser);
router.route("/stuffDetail").get(userDetail);

router.route("/listUser/:userId").get(generatedIdManagerParams, getUser);

module.exports = router;
