const router = require("express").Router();
let debug = require("debug-levels")("userApi");
const User = require("../models/User");
const UserLib = require("../lib/UserLib");
const AppConfig = require("../lib/AppConfig");
const CloudinaryLib = require("../lib/Cloudinary");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const checkAuth = require("../middleware/check-auth");
var jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

cloudinary.config({
  cloud_name: AppConfig.cloudinaryName,
  api_key: AppConfig.cloudinaryApi,
  api_secret: AppConfig.cloudinarySecret,
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "Users",
  allowedFormats: ["jpg", "png"],
});
const parser = multer({ storage: storage });

router.post("/user/sendEmail", async (req, res) => {
  const userEmail = req.body.recipientEmail;
  const userName = req.body.recipientName;
  const userLat = req.body.lat;
  const userLng = req.body.lng;

  // Create a transporter using your email configuration
  const transporter = nodemailer.createTransport({
    // service: "gmail",
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: "hassaanbinsajid008@gmail.com",
      pass: "DU5j9vVBtFq6Nmwd",
    },
  });

  // Prepare the email options
  const mailOptions = {
    from: "hemo.fypnust@gmail.com",
    to: userEmail,
    subject: "Urgent Email",
    text: `Dear ${userName},
  
  I hope this email finds you well. I am reaching out to you on behalf of Hemo, an application dedicated to connecting blood donors with those in need. We have received a request for blood donation from a user who is urgently seeking assistance, and you have been recommended as a potential donor.
  
  Below, you will find the details of the individual who is in need of blood:
  
  Click on the link to access maps
  [Google Maps Link](https://www.google.com/maps/dir/?api=1&destination=${userLat},${userLng})
  
  Please note that the information provided has been verified by our team, and the need for blood is genuine. Your willingness to donate could make a significant difference in saving a life.
  `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent:", info.response);
      res.status(200).send("Email sent successfully");
    }
  });
});

// Saving User
router.post(
  "/user/save",
  parser.single("profile_picture"),
  async (req, res) => {
    let cloudinaryData = req.file;
    let profile_picture = {};
    debug.info(cloudinaryData);
    let data = JSON.parse(req.body.user);
    // let data = req.body  // for test on Postman
    if (!data) {
      debug.error("ERROR: No Data found in User request!");
      res.status(500).send("ERROR: No Data found in User request!");
    }
    profile_picture = await CloudinaryLib.createImage(cloudinaryData);
    data.profile_picture = profile_picture || {};
    let checker = await UserLib.findUserByEmail(data.email);
    if (!checker) {
      data = await UserLib.bcryptPassword(data);
      debug.error("found in User request!", data);
      if (data) {
        let reply = await UserLib.saveUser(data);
        if (reply) {
          res.status(200).send("User Saved!");
        } else {
          res
            .status(500)
            .send("ERROR: Duplicate Field Found or Error Saving User!");
        }
      } else {
        res.status(500).send("ERROR: Adding Hash For Passowrd!");
      }
    } else {
      debug.info("ERROR: Duplicate Email Found!");
      res.status(500).send("ERROR: Duplicate Email Found");
    }
  }
);

//deleting User Image
router.delete("/userImage/delete", async (req, res) => {
  let response;
  const data = req.body;
  if (!data) {
    debug.error("ERROR: user is Undefined!", data);
    res.status(500).send("ERROR: user is Undefined!");
  }
  let ID = data.ID;
  let profile_picture = data.profile_picture;

  let user = await UserLib.findUserById(data);
  debug.info(user);
  if (user) {
    response = await CloudinaryLib.deleteImage(user, profile_picture);
  } else {
    res.status(500).send("ERROR: Finding User!");
  }
  debug.info("Response: ", response);
  if (response) {
    let newUser;
    newUser = user[0];
    delete user[0].profile_picture;
    let reply = await UserLib.updateUser(user[0]);
    if (reply) {
      res
        .status(200)
        .send(
          "Image Deleted! Both in Database And Cloudinary And User Updated!"
        );
    } else {
      res
        .status(500)
        .send("ERROR: Can't Update User after Deleting Image from Cloudinary!");
    }
  } else {
    res.status(500).send("ERROR: Deleting Picture in Cloudinary!!");
  }
});

// Updating User
router.patch(
  "/user/update",
  checkAuth,
  parser.single("profile_picture"),
  async (req, res) => {
    let cloudinaryData = req.file;
    let profile_picture = {};
    debug.info(cloudinaryData);
    let data = JSON.parse(req.body.user);
    // let data = req.body   //for testing in postman
    if (!data) {
      debug.error("ERROR: No Data found in User request!");
      res.status(500).send("ERROR: No Data found in User request!");
    }
    profile_picture = await CloudinaryLib.createImage(cloudinaryData);
    debug.info(profile_picture);
    data.profile_picture = profile_picture;
    debug.info(data.profile_picture);
    let checker = await UserLib.findOneUser(data.ID);
    if (checker) {
      if (checker.email === data.email.toLowerCase()) {
        let reply = await UserLib.updateUser(data);
        if (reply) {
          res.status(200).send("User Updated!");
        } else {
          res.status(500).send("ERROR: No ID Found or Error Updating User!");
        }
      } else {
        debug.info("ERROR: Email did not match!");
        res.status(500).send("ERROR: No ID Found or Error Updating User!");
      }
    } else {
      debug.info("ERROR: No ID Found!");
      res.status(500).send("ERROR: No ID Found!");
    }
  }
);

// User signIn
router.post("/user/signIn", async (req, res) => {
  if (!req.body.user) {
    debug.error("ERROR: No Data found in User Sign In request!");
    res.status(500).send("ERROR: No Data found in User Sign In request!");
  }
  let data = JSON.parse(req.body.user);
  // let data = req.body   //for testing in postman
  let email = data.email;
  let password = data.password;
  let response = await UserLib.findUserByEmail(email);
  if (response) {
    let reply = await UserLib.bcryptComparePassword(
      response.password,
      password
    );
    if (!reply) {
      debug.info("Auth Failed!");
      res.status(401).send("ERROR: Auth Failed!");
    }
  } else {
    debug.info("ERROR: No User Found!");
    res.status(500).send("ERROR: No User Found!");
  }

  const user = response;
  jwt.sign(
    { user: user },
    AppConfig.JWT_KEY,
    {
      expiresIn: "14 days",
    },
    (err, token) => {
      if (err) {
        debug.info("ERROR: Signing JWT Token!", err);
        res.status(500).send("ERROR: Signing JWT Token!");
      } else {
        res.status(200).json({
          message: "Auth Success!",
          Token: token,
        });
      }
    }
  );
});

// fetching all indexes
router.get("/user/getIndex", async (req, res) => {
  let reply = await UserLib.getIndexx();
  if (reply) {
    res.status(200).send(reply);
  } else {
    res
      .status(500)
      .send("ERROR: No User Index Found Or Error Fetching Indexes in Users!");
  }
});

// fetching all Users
router.get("/user/me", checkAuth, async (req, res) => {
  if (!req.user) {
    res.status(500).send("ERROR: No User Found Or Error Decoding User!");
  } else {
    res.status(200).send(req.user);
  }
});

// fetching all Users
router.get("/user/fetch", async (req, res) => {
  if (req.query.city && req.query.antigen) {
    try {
      const cityName = req.query.city;
      console.log(cityName);
      const antigen = decodeURIComponent(req.query.antigen);
      console.log(antigen);
      const users = await User.find({ cityName: cityName, antigen: antigen });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.query.city) {
    try {
      const cityName = req.query.city;
      const users = await User.find({ cityName: cityName });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.query.antigen) {
    try {
      const antigen = decodeURIComponent(req.query.antigen);
      const users = await User.find({ antigen: antigen });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    let reply = await UserLib.fetchAllUsers();
    if (reply) {
      res.status(200).send(reply);
    } else {
      res.status(500).send("ERROR: No User Found Or Error Fetching Users!");
    }
  }
});

// fetching User by ID
router.get("/user/fetchById/:Id", async (req, res) => {
  let Id = req.params.Id;
  if (!Id) {
    debug.error("ERROR: No Id found in User request!");
    res.status(500).send("ERROR: No Id found in User request!");
  }
  let reply = await UserLib.findUserById(Id);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res
      .status(500)
      .send("ERROR: No User Found Or Error Fetching User By Name!");
  }
});

//fetching User by First Name
router.get("/user/fetchByFirstName/:first_name", async (req, res) => {
  let first_name = req.params.first_name;
  if (!first_name) {
    debug.error("ERROR: No name found in User request!");
    res.status(500).send("ERROR: No name found in User request!");
  }
  let reply = await UserLib.findUserByFirstName(first_name);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res
      .status(500)
      .send("ERROR: No User Found Or Error Fetching User By Name!");
  }
});

//fetching User by Email
router.get("/user/fetchByEmail/:email", async (req, res) => {
  let email = req.params.email;
  if (!email) {
    debug.error("ERROR: No name found in User request!");
    res.status(500).send("ERROR: No name found in User request!");
  }
  let reply = await UserLib.findUserByEmail(email);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res
      .status(500)
      .send("ERROR: No User Found Or Error Fetching User By Name!");
  }
});

//fetching User by Phone
router.get("/user/fetchByPhone/:phone", async (req, res) => {
  let phone = req.params.phone;
  if (!phone) {
    debug.error("ERROR: No name found in User request!");
    res.status(500).send("ERROR: No name found in User request!");
  }
  let reply = await UserLib.findUserByPhone(phone);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res
      .status(500)
      .send("ERROR: No User Found Or Error Fetching User By Name!");
  }
});

//fetching all Users by City
router.get("/user/fetchByCity/:city_id", async (req, res) => {
  let city_id = req.params.city_id;
  if (!city_id) {
    debug.error("ERROR: No name found in User request!");
    res.status(500).send("ERROR: No name found in User request!");
  }
  let reply = await UserLib.findUserByCity(city_id);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res
      .status(500)
      .send("ERROR: No User Found Or Error Fetching User By Name!");
  }
});

//Delete User by ID
router.delete("/delete/user-deleteById/:Id", async (req, res) => {
  let Id = req.params.Id;
  if (!Id) {
    debug.error("ERROR: No ID found in User request!");
    res.status(500).send("ERROR: No ID found in User request!");
  }
  let reply = await UserLib.deleteUserById(Id);
  if (reply) {
    res.status(200).send(reply);
  } else {
    res.status(500).send("ERROR: No User Found Or Deleting User!");
  }
});

module.exports = router;
