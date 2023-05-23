const AppConfig = require('./AppConfig')
const Cloudinary = require('./Cloudinary')
const Project = require('../models/Project')
// const Project = require('mongoose').model('Cities')
let debug = require("debug-levels")("ProjectLib")

const ProjectLib = {

  async saveProject (data) {
    let res
    data.created_At = new Date()
    const project = new Project(data)
    await project.save().then(result => {
      if(!result) {
        debug.error("ERROR: Saving Project!")
        return
      }
      debug.info('Project Saved Result', result)
      res = result
    })
    .catch(error => {
      debug.error("ERROR: Found in Project!", error)
      return
    })
    return res
  },


  async updateProject (data) {
    let res
    let Id = data.ID
    await Project.findOneAndUpdate({
      ID: Id
    },
    data,
    {upsert:false}
    )
    .then(result => {
      if(!result) {
        debug.error("No ID Found or ERROR: updating Project!")
        return
      }
      debug.info('Project Updated Result', result)
      res = result
    })
    .catch(error => {
      debug.error("ERROR: Found in updating Project!", error)
      return
    })
    return res
  },

  async fetchManyCities (data) {
    let reply 
    await Project.find({
      ID: { $in: data }
    })
    .exec()
    .then(res => {
      if (res.length == 0) {
        return
      }
      debug.info('Cities: ', res)
      reply = res
    })
    .catch(error => {
      debug.error("No Cities found", error)
      return
    })
    return reply
  },

  async fetchAllProjects () {
    let reply 
    await Project.find()
    .exec()
    .then(res => {
      if (res.length == 0) {
        return
      }
      debug.info('Projects: ', res)
      reply = res
    })
    .catch(error => {
      debug.error("No projects found", error)
      return
    })
    return reply
  },

  async countProjects () {
    try {
      const projectRes = await Project.countDocuments()
      if(!projectRes) {
        throw new Error('No Projects Found!')
      }
      debug.info('Projects: ', projectRes)
      return projectRes
    } catch (error) {
      debug.error("ERROR: No projectRes Found!", error)
      return
    }
  },

  async fetchPaginationProjects (pageSize, pageNumber) {
    pageNumber = Number(pageNumber)
    pageSize = Number(pageSize)
    try {
      const projectRes = await Project.find()
      .skip(pageSize * (pageNumber - 1))
      .limit(pageSize)
      if(!projectRes) {
        throw new Error('No Projects Found!')
      }
      debug.info('Projects: ', projectRes)
      return projectRes
    } catch (error) {
      debug.error("ERROR: No Projects Found!", error)
      return
    }
  },

  async findProjectById (ID) {
    let reply 
    await Project.find({
      ID : ID
    })
    .then(res => {
      if (res.length == 0) {
        return
      }
      debug.info('Project: ', res)
      reply = res
    })
    .catch(error => {
      debug.error("No Project found", error)
      return
    })
    return reply
  },

  async findProjectByName (name) {
    let reply 
    await Project.find({ 
        name: 
        { 
          $regex: name, $options: 'i'
        } 
    })
    .then(res => {
      if (res.length == 0) {
        return
      }
      debug.info('Project: ', res)
      reply = res
    })
    .catch(error => {
      debug.error("No Project found", error)
      return
    })
    return reply
  },

  async findCityByProvince (province) {
    let reply 
    await Project.find({
      province: province
    })
    .then(res => {
      if (res.length == 0) {
        return
      }
      debug.info('Project: ', res)
      reply = res
    })
    .catch(error => {
      debug.error("No Project found", error)
      return
    })
    return reply
  },

  async deleteProjectById (ID) {
    let reply
    await ProjectLib.deleteImages(ID)
    await Project.findOneAndDelete({ 
      ID: ID 
    })
    .then (res => {
      if (!res) {
        return
      }
      debug.info('Project: ', res)
      reply = res
    })
    .catch(error => {
      debug.error("No Project found", error)
      return
    })
    return reply
  },

  async deleteImages (Id) {
    let reply
    let project = await ProjectLib.findProjectById(Id)
    if(project) {
      reply = Cloudinary.deleteMultipleImages(project)
      if(reply) {
        debug.info('Picture Deleted! ', reply)
      } else {
        debug.error("ERROR: No Pictures Found OR Error Deleting Pictures of Project!")
      }
    } else {
      debug.error("ERROR: No Project Found To Delete Images!")
    }
  },

  async fetchUrlImages (ID, url) {
    try {
      const cityRes = await Project.findOne({
        ID: ID,
        "gallery.url": url
      })
      if(!cityRes) {
        throw new Error('No Project Found!')
      }
      debug.info('Project: ', cityRes)
      return cityRes
    } catch (error) {
      debug.error("ERROR: No Project Found!", error)
      return
    }
  },

  async deletePictureObject (image, url) {
    let newArrayObject = []
    let gallery = image.gallery
    gallery.map( galleryObject => {
      if(galleryObject.url !== url) {
        newArrayObject.push(galleryObject)
      }
    })
    return newArrayObject
  },

  async deleteCityGallery (ID, url) {
    let image = await CityLib.fetchUrlImages(ID, url)
    if(image) {
      let gallery = await CityLib.deletePictureObject(image, url)
      image.gallery = gallery
      return image
    }
    else {
      debug.error("ERROR: No Project Gallery Data Found To Delete Project Gallery Data!")
    }
  },


}

module.exports = ProjectLib