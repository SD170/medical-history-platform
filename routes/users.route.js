const router = require("express").Router();
const {
  createUser,
  loginUser,
  userDetail,
} = require("../controllers/user.controller");
const { authenticate, setLevel3Role } = require("../middlewares/permissions");

router.route("/register").post(setLevel3Role, createUser);
router.route("/login").post(setLevel3Role, loginUser);
router.use(authenticate);
router.route("/userDetail").get(userDetail);

module.exports = router;
