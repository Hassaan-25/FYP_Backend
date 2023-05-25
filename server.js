// const busboy = require('connect-busboy') //middleware for form/file upload
const debug = require("debug-levels")("server");
const path = require("path");
const express = require("express");
const ModelUtils = require("./models/ModelUtils");
var jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
const cors = require("cors");

// require .env
require("dotenv").config();

// basic
const DbConn = require("./lib/DbConn");

const app = require("./routes/Router");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const port = process.env.PORT || 3001;

const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "../../my-app/build");
app.use(express.static(buildPath));

app.get("/*", function (req, res) {
  res.sendFile(
    path.join(__dirname, "../../my-app/build/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

async function startUp() {
  // init models to load db conn
  await DbConn.init();
  await ModelUtils.initAll();

  app.listen(port, function () {
    console.log("fe-backend server listening on port ", port);
  });
}

startUp();
