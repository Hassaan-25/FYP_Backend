const router = require("express").Router();
let debug = require("debug-levels")("loginApi");
const AppConfig = require("../lib/AppConfig");
var jwt = require("jsonwebtoken");

// login
router.post("/login", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (password === AppConfig.PASSWORD && email === AppConfig.EMAIL) {
    const user = {
      id: 1,
      username: AppConfig.cloudinaryName,
      email: AppConfig.EMAIL,
    };
    jwt.sign({ user: user }, AppConfig.JWT_KEY, (err, token) => {
      res.json({
        token,
      });
    });
  } else {
    debug.error("ERROR: No User Found!");
    res.status(500).send("ERROR: No User Found!");
  }
});

module.exports = router;
