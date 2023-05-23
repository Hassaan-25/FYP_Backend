const AppConfig = require("./AppConfig");
const User = require("mongoose").model("Users");
let debug = require("debug-levels")("UserLib");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const UserLib = {
  async saveUser(data) {
    let res;
    data.email = data.email.toLowerCase();
    const user = new User(data);
    await user
      .save()
      .then((result) => {
        if (!result) {
          debug.error("ERROR: Saving User!");
          return;
        }
        debug.info("User Saved Result", result);
        res = result;
      })
      .catch((error) => {
        debug.error("ERROR: Found in User!", error);
        return;
      });
    return res;
  },

  async bcryptPassword(data) {
    let password = data.password;
    let result = new Promise((resolve) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          debug.info("ERROR: Creating Hash for Password!", err);
          return;
        } else {
          data.password = hash;
          debug.info("Hash for Password!", data);
          resolve(data);
        }
      });
    });
    return result;
  },

  async bcryptComparePassword(hash, password) {
    let result = new Promise((resolve) => {
      bcrypt.compare(password, hash, function (err, res) {
        if (err) {
          debug.info("ERROR: Comparing Hash Password!", err);
          return;
        } else {
          debug.info("Comparing Hash Password!", res);
          resolve(res);
        }
      });
    });
    return result;
  },

  async updateUser(data) {
    let res;
    data.email = data.email.toLowerCase();
    await User.findOneAndUpdate(
      {
        ID: data.ID,
      },
      data,
      { upsert: false }
    )
      .then((result) => {
        if (!result) {
          debug.error("No ID Found or ERROR: updating User!");
          return;
        }
        debug.info("User Updated Result", result);
        res = result;
      })
      .catch((error) => {
        debug.error("ERROR: Found in updating User!", error);
        return;
      });
    return res;
  },

  async fetchAllUsers() {
    let reply;
    await User.find()
      .exec()
      .then((res) => {
        if (res.length == 0) {
          return;
        }
        debug.info("Users: ", res);
        reply = res;
      })
      .catch((error) => {
        debug.error("No Users found", error);
        return;
      });
    return reply;
  },

  async getIndexx() {
    try {
      const userRes = await User.collection.getIndexes();
      if (!userRes) {
        throw new Error("No User Index Found!");
      }
      debug.info("Users Indexes: ", userRes);
      return userRes;
    } catch (error) {
      debug.info(error);
      return;
    }
  },

  async findOneUser(ID) {
    try {
      let userRes = await User.findOne({
        ID: ID,
      });
      if (!userRes) {
        throw new Error("No User Found!");
      }
      debug.info("User: ", userRes);
      return userRes;
    } catch (error) {
      debug.error("ERROR: No User Found!", error);
      return;
    }
  },

  async findUserById(ID) {
    ID = parseInt(ID);
    try {
      const userRes = await User.aggregate([
        {
          $match: {
            ID: ID,
          },
        },
        {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "ID",
            as: "city",
          },
        },
        {
          $unwind: {
            path: "$city",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            details: { $ne: [] },
          },
        },
      ]);
      if (!userRes) {
        throw new Error("No User Found!");
      }
      debug.info("User: ", userRes);
      return userRes;
    } catch (error) {
      debug.error("ERROR: No User Found!", error);
      return;
    }
  },

  async findUserByFirstName(first_name) {
    let reply;
    await User.find({
      first_name: first_name,
    })
      .then((res) => {
        if (res.length == 0) {
          return;
        }
        debug.info("User: ", res);
        reply = res;
      })
      .catch((error) => {
        debug.error("No User found", error);
        return;
      });
    return reply;
  },

  async findUserByEmail(email) {
    email = email.toLowerCase();
    try {
      const experienceRes = await User.findOne({
        email: email,
      });
      if (!experienceRes) {
        throw new Error("No User Found!");
      }
      debug.info("User: ", experienceRes);
      return experienceRes;
    } catch (error) {
      debug.error("ERROR: No User Found!", error);
      return;
    }
  },

  async findUserByPhone(phone) {
    let reply;
    await User.find({
      phone: phone,
    })
      .then((res) => {
        if (res.length == 0) {
          return;
        }
        debug.info("User: ", res);
        reply = res;
      })
      .catch((error) => {
        debug.error("No User found", error);
        return;
      });
    return reply;
  },

  async findUserByCity(city_id) {
    let reply;
    await User.find({
      city_id: city_id,
    })
      .then((res) => {
        if (res.length == 0) {
          return;
        }
        debug.info("User: ", res);
        reply = res;
      })
      .catch((error) => {
        debug.error("No User found", error);
        return;
      });
    return reply;
  },

  async deleteUserById(ID) {
    let reply;
    await User.findOneAndDelete({
      ID: ID,
    })
      .then((res) => {
        if (!res) {
          return;
        }
        debug.info("User: ", res);
        reply = res;
      })
      .catch((error) => {
        debug.error("No User found", error);
        return;
      });
    return reply;
  },
};

module.exports = UserLib;
