var config =  require ('../config.js')
let AppConfigLocal = {
	cloudinarySecret: config.cloudinary.CLOUDINARY_SECRET,
	cloudinaryApi: config.cloudinary.CLOUDINARY_API,
	cloudinaryName: config.cloudinary.CLOUDINARY_NAME,
	EMAIL: config.EMAIL,
	PASSWORD: config.PASSWORD,
	JWT_KEY: config.JWT_KEY
}

let AppConfig = Object.assign(AppConfigLocal)

module.exports = AppConfig