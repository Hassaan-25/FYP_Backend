const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    siteUrl: "http://localhost:3001",
    port: 3001,

    cloudinary: {
      CLOUDINARY_NAME: "",
      CLOUDINARY_SECRET: "",
      CLOUDINARY_API: "",
    },
    db: {
      username: "",
      DB_NAME: "",
      mongoUri: "",
    },
    EMAIL: "",
    PASSWORD: "",
  },
  production: {
    siteUrl: "",
    port: 3001,
    cloudinary: {
      CLOUDINARY_NAME: "",
      CLOUDINARY_SECRET: "",
      CLOUDINARY_API: "",
    },
    db: {
      username: "",
      DB_NAME: "",
      mongoUri: "",
    },
    EMAIL: "",
    PASSWORD: "",
  },
};

module.exports = config[env];
