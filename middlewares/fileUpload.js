const fs = require("fs");

const path = require("path");
const multer = require("multer");

const fileStorageEngine = multer.diskStorage({
  destination: (req, fle, cb) => {
    const destPath = path.join(process.env.FILE_UPLOAD_PATH, "files");
    fs.mkdirSync(destPath, { recursive: true }); //creates the path if doesn't exists
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

//multer middleware create
exports.multerUpload = multer({
  storage: fileStorageEngine,
  limits: {
    fileSize: Number(process.env.FILE_UPLOAD_MAX_SIZE) || 20000000, //20MB
  },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
}).fields([{ name: "prescriptions" }, { name: "testReports" }]);
