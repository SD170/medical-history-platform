const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class Helper {
  hashPassword = async (password) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      return hashedPassword;
    } catch (err) {
      throw err;
    }
  };
}

module.exports = new Helper();
