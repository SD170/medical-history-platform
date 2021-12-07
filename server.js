const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middlewares/error");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

const { generatedIdManager } = require("./middlewares/generalMiddlewares");

//load env vars
dotenv.config({ path: "./config.env" });

//Connect to database
connectDB();

//route files
const usersRoute = require("./routes/users.route");
const adminRoute = require("./routes/admins.route");
const hospitalRoute = require("./routes/hospitals.route");
const stuffRoute = require("./routes/stuffs.route");
const timelineRoute = require("./routes/timelines.route");

const app = express();

//body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

//dev logging middleware
if (process.env.NODE_ENV === "development") {
  //only when using dev env
  app.use(morgan("dev"));
}

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//mount routers
app.use(generatedIdManager);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/hospital", hospitalRoute);
app.use("/api/v1/hospitalStuff", stuffRoute);
app.use("/api/v1/timeline", timelineRoute);

//error middleware - should be at last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//handle unhandled PromeseRejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //Close Server & exit process
  server.close(() => process.exit(1));
});
