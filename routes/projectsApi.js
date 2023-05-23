const router = require("express").Router();
let debug = require("debug-levels")("projectsApi");
const Project = require("../models/Project");
const ProjectLib = require("../lib/ProjectLib");
const AppConfig = require("../lib/AppConfig");
const CloudinaryLib = require("../lib/Cloudinary");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const checkAuth = require("../middleware/check-auth");

cloudinary.config({
  cloud_name: AppConfig.cloudinaryName,
  api_key: AppConfig.cloudinaryApi,
  api_secret: AppConfig.cloudinarySecret,
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "Projects",
  allowedFormats: ["jpg", "png", "jpeg"],
});
const parser = multer({ storage: storage });

// Saving Projects
router.post(
  "/save/project-save",
  checkAuth,
  parser.array("gallery_images"),
  async (req, res) => {
    let cloudinaryData = req.files;
    let gallery = [];
    debug.info(cloudinaryData);
    console.log(req.body);
    let data = JSON.parse(req.body.project);
    // let data = req.body  // for test on Postman
    if (!data) {
      debug.error("ERROR: No Data found in Project POST request!");
      res.status(500).send("ERROR: No Data found in Project POST request!");
    }
    gallery = await CloudinaryLib.createGallery(data, cloudinaryData);
    data.gallery = gallery;
    let reply = await ProjectLib.saveProject(data);
    if (reply) {
      res.status(200).send("Project Saved!");
    } else {
      res
        .status(500)
        .send("ERROR: Duplicate Field Found or Error Saving Project!");
    }
  }
);

// Updating Projects
router.patch(
  "/update/project-update",
  checkAuth,
  parser.array("gallery_images"),
  async (req, res) => {
    let cloudinaryData = req.files;
    let gallery = [];
    debug.info(cloudinaryData);
    let data = JSON.parse(req.body.project);
    // let data = req.body   //for testing in postman
    if (!data) {
      debug.error("ERROR: No Data found in Project UPDATE request!");
      res.status(500).send("ERROR: No Data found in Project UPDATE request!");
    }
    if (cloudinaryData && cloudinaryData.length > 0) {
      gallery = await CloudinaryLib.updateGallery(data, cloudinaryData);
      data.gallery = gallery;
      delete data.image_type;
      let reply = await ProjectLib.updateProject(data);
      if (reply) {
        res.status(200).send("Project Updated!");
      } else {
        res.status(500).send("ERROR: No ID Found or Error Updating Project!");
      }
    } else {
      let reply = await ProjectLib.updateProject(data);
      if (reply) {
        res.status(200).send("Project Updated!");
      } else {
        res.status(500).send("ERROR: No ID Found or Error Updating Project!");
      }
    }
  }
);

// fetching all Projects
router.get("/fetch/project-fetch", async (req, res) => {
  let reply = [];
  let all = req.query.all || false;
  let pageSize = req.query.pageSize || 10;
  let pageNumber = req.query.pageNumber || 1;
  if (all) {
    reply = await ProjectLib.fetchAllProjects();
  } else {
    reply = await ProjectLib.fetchPaginationProjects(pageSize, pageNumber);
  }
  if (reply) {
    let count = await ProjectLib.countProjects();
    let response = {
      total: count || 0,
      items: reply,
    };
    res.status(200).send(response);
  } else {
    res.status(500).send("ERROR: No Project Found Or Error Fetching projects!");
  }
});

// fetching Projects by ID
router.get("/fetchById/project-fetchById/:Id", async (req, res) => {
  let Id = req.params.Id;
  if (!Id) {
    debug.error("ERROR: No ID found in Project FetchByID request!");
    res.status(500).send("ERROR: No ID found in Project FetchByID request!");
  }
  let reply = await ProjectLib.findProjectById(Id);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res
      .status(500)
      .send("ERROR: No Project Found Or Error Fetching Project By ID!");
  }
});

//fetching Projects by Name
router.get("/fetchByName/project-fetchByName/:name", async (req, res) => {
  let name = req.params.name;
  if (!name) {
    debug.error("ERROR: No name found in Project FetchByName  request!");
    res
      .status(500)
      .send("ERROR: No name found in Project FetchByName  request!");
  }
  let reply = await ProjectLib.findProjectByName(name);
  if (reply) {
    let total = reply.length;
    let projectRes = {
      total: total,
      items: reply,
    };
    res.status(200).send(projectRes);
  } else {
    res
      .status(500)
      .send("ERROR: No Project Found Or Error Fetching Project By Name!");
  }
});

//fetching all Projects by Province
router.get(
  "/fetchByProvince/project-fetchByProvince/:province",
  async (req, res) => {
    let province = req.params.province;
    if (!province) {
      debug.error(
        "ERROR: No province found in Project FetchByProvince request!"
      );
      res
        .status(500)
        .send("ERROR: No province found in Project FetchByProvince request!");
    }
    let reply = await CityLib.findCityByProvince(province);
    if (reply) {
      res.status(200).send(reply);
    } else {
      res
        .status(500)
        .send("ERROR: No Project Found Or Error Fetching Project By province!");
    }
  }
);

//Delete  by ID Project
router.delete("/delete/project-deleteById/:Id", async (req, res) => {
  let Id = req.params.Id;
  if (!Id) {
    debug.error("ERROR: No ID found in Project Delete request!");
    res.status(500).send("ERROR: No ID found in Project Delete request!");
  }
  let reply = await ProjectLib.deleteProjectById(Id);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res.status(500).send("ERROR: No Project Found Or Deleting Project!");
  }
});

//Delete image by ID and Url
router.delete("/deleteGallery/project-deleteGallery", async (req, res) => {
  if (!req.body.cityGallery) {
    debug.error("ERROR: No Project Gallery found in Gallery Delete request!");
    res
      .status(500)
      .send("ERROR: No Project Gallery found in Gallery Delete request!");
  }
  let data = JSON.parse(req.body.cityGallery);
  // let data = req.body  // for test on Postman
  let url = data.url;
  let ID = data.ID;
  let reply = await CityLib.deleteCityGallery(ID, url);
  if (reply) {
    let response = await CityLib.updateCity(reply);
    if (response) {
      res.status(200).send(response);
    } else {
      res.status(500).send("ERROR: Updating Project Gallery!");
    }
  } else {
    res
      .status(500)
      .send("ERROR: No Project Found Or Error Deleting Project Gallery!");
  }
});

module.exports = router;
