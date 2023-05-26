const debug = require("debug-levels")("Router");
const express = require("express");
const cors = require("cors");

const app = express();

const whitelist = [
  "https://admin.dev.saaditrips.com",
  "https://margallatours.com",
  "http://margallatours.com",
  "https://www.margallatours.com",
  "https://admin.saaditrips.com",
  "https://saaditrips.com",
  "https://admindev.saaditrips.com",
  "http://admindev.saaditrips.com",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
  "https://dev.saaditrips.com",
  "https://hemo-fyp.azurewebsites.net",
  "https://putlb.localto.net",
];
// const corsOptions = {
//   origin(origin, callback) {
//     console.log(
//       "---------------------------------\n origin: ",
//       origin,
//       "\n---------------------------------"
//     );
//     if (
//       whitelist.indexOf(origin) !== -1 ||
//       !origin ||
//       (app.get("env") === "development" &&
//         (origin.indexOf("192.168") >= 0 || origin === "null")) ||
//       origin === "null"
//     ) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };
const corsOptions = {
  origin: "*", // Allow requests from any origin
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/", function (req, res, next) {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  debug.info("<<<<<<<<< REQUEST INFO: >>>>>>>>>>");
  debug.info(dateTime);
  debug.info(req.protocol + "://" + req.get("host") + req.originalUrl);
  next();
});

app.use(express.json({ limit: "50mb" }));

let routerList = ["./projectsApi.js", "./userApi.js", "./loginApi.js"];

for (let routerPath of routerList) {
  debug.info("rp", routerPath);
  let mod = require(routerPath);
  app.use("/api", mod);
}

module.exports = app;
