var jwt = require('jsonwebtoken')
const AppConfig = require('../lib/AppConfig')
let debug = require("debug-levels")("check-auth")

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      debug.info('No Authorization Token Found!', error)
      return res.status(403).json({
        message: "No Authorization Token Found!"
      })
    }
    const token = req.headers.authorization.split(" ")[1]
    const decode = jwt.verify(token, AppConfig.JWT_KEY)
    req.user = decode.user
    next()
  } catch (error) {
    debug.info('Authentication Failed!', error)
    return res.status(401).json({
      message: "Authentication Failed!"
    })
  }
}