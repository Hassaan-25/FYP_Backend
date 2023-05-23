const AppConfig = require('./AppConfig')
let debug = require("debug-levels")("Cloudinary")
const multer  = require('multer')
const cloudinary = require('cloudinary')
const cloudinaryStorage = require("multer-storage-cloudinary")


cloudinary.config({ 
  cloud_name: AppConfig.cloudinaryName, 
  api_key: AppConfig.cloudinaryApi, 
  api_secret: AppConfig.cloudinarySecret 
})

const Cloudinary = {
	async uploadImage () {
		new Promise((resolve) => {
      cloudinary.v2.uploader.upload("./image.png", 
    	function(error, result) {
				if (error) {
					debug.error(error)
					resolve()
				} else {
					debug.info(result)
					resolve(result)
				}
			})
    })
	},

	async cloudinaryConfig() {
		const storage = cloudinaryStorage({
			cloudinary: cloudinary,
			folder: "Cities",
			allowedFormats: ["jpg", "png", "jpeg"],
		})
		const parser = await multer({ storage: storage })
		return parser
	},

	async deleteImage (res, profile_picture) {
		let reply
		res = res[0]
		if (res.profile_picture.public_id == profile_picture.public_id) {
			const public_id = profile_picture.public_id
			await cloudinary.v2.uploader.destroy(
				public_id, 
				{invalidate: true }, 
				function(error, result) {
				if (error) {
					debug.error('ERROR: Cant Delete image', error)
					return
				}
				else {
					debug.info('Image Deleted!', result)
					reply = result
				}
			})
		}
		else {
			debug.error("ERROR: public_id not matched")
			return
		}
		return reply
	},

	async createImage (cloudinaryData) {
		let pictureObject
		if(cloudinaryData) {
			debug.info(cloudinaryData.public_id)
			 debug.info(cloudinaryData.url)
				pictureObject = {
					public_id: cloudinaryData.public_id,
					url: cloudinaryData.url
				}
			return pictureObject
		}
	},

	async createGallery (data, cloudinaryData) {
		let gallery = []
		if(cloudinaryData) {
			cloudinaryData.map(picture => {
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url,
					type: data.image_type
				}
				gallery.push(pictureObject)
			})
			return gallery
		}
	},

	async createExperienceGallery (data, cloudinaryData) {
		let gallery = []
		if(cloudinaryData) {
			cloudinaryData.map(picture => {
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url,
					image_Title: data.image_Title
				}
				gallery.push(pictureObject)
			})
			return gallery
		}
	},

	async createExperienceGuestGallery (data, cloudinaryData) {
		let guest_gallery = []
		if(cloudinaryData) {
			cloudinaryData.map(picture => {
				debug.info('pictureee:::: ', picture)
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url,
					image_Title: data.image_Title
				}
				guest_gallery.push(pictureObject)
			})
			return guest_gallery
		}
	},

	async createImages (cloudinaryData) {
		let gallery = []
		if(cloudinaryData) {
			cloudinaryData.map(picture => {
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url
				}
				gallery.push(pictureObject)
			})
			return gallery
		}
	},

	async updateImages (data, cloudinaryData) {
		let gallery = []
		if(cloudinaryData) {
			cloudinaryData.map(picture => {
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url
				}
				if (data.images) {
					data.images.push(pictureObject)
					gallery = data.images 
				} else {
					gallery.push(pictureObject)
				}
			})
			return gallery
		}
	},

	async updateGallery (data, cloudinaryData) {
		let gallery = []
		if(cloudinaryData) {
			cloudinaryData.map(picture => {
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url,
					image_type: data.image_type
				}
				if (data.gallery) {
					data.gallery.push(pictureObject)
					gallery = data.gallery 
				} else {
					gallery.push(pictureObject)
				}
			})
			return gallery
		}
	},

	async updateExperienceGallery (data, cloudinaryData) {
		let gallery = []
		if(cloudinaryData && cloudinaryData.length > 0) {
			cloudinaryData.map(picture => {
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url,
					image_Title: data.image_Title
				}
				if (data.gallery) {
					data.gallery.push(pictureObject)
					gallery = data.gallery 
				} else {
					gallery.push(pictureObject)
				}
			})
			return gallery
		} else {
			return data.gallery || []
		}
	},

	async updateExperienceGuestGallery (data, cloudinaryData) {
		let guest_gallery = []
		if(cloudinaryData && cloudinaryData.length > 0) {
			cloudinaryData.map(picture => {
				let pictureObject = {
					public_id: picture.public_id,
					url: picture.url,
					image_Title: data.image_Title
				}
				if (data.guest_gallery) {
					data.guest_gallery.push(pictureObject)
					guest_gallery = data.guest_gallery 
				} else {
					guest_gallery.push(pictureObject)
				}
			})
			return guest_gallery
		} else {
			return data.guest_gallery || []
		}
	},

	async deleteSingleImage (public_id) {
		let reply
		if(public_id) {
			new Promise((resolve) => {
				cloudinary.v2.uploader.destroy(
					public_id, 
					{invalidate: true }, 
					function(error, result) {
					if (error) {
						debug.error('ERROR: Cant Delete image', error)
						resolve()
					}
					else {
						debug.info('Image Deleted!', result)
						reply = result
						resolve(reply)
					}
				})
			})
		} else {
			debug.error("ERROR: No public_id Found To Delete Image!")
		}
		return reply
	},

	async deleteMultipleHotelImages(data) {
		let images
		if(data[0].images) {
			images = data[0].images
		}
		let reply
		if (images && images.length > 0) {
			images.map(picture => {
				let public_id = picture.public_id
				reply = Cloudinary.deleteSingleImage(public_id)
			})
		} else {
			debug.error('No images Found !')
			return
		}
		return reply
	},

	async deleteMultipleImages(data) {
		let gallery
		if(data[0].gallery) {
			gallery = data[0].gallery
		}
		let reply
		if (gallery && gallery.length > 0) {
			gallery.map(picture => {
				let public_id = picture.public_id
				reply = Cloudinary.deleteSingleImage(public_id)
			})
		} else {
			debug.error('No Gallery Found !')
			return
		}
		return reply
	}
}

module.exports = Cloudinary