const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    siteUrl: "http://localhost:3001",
    port: 3001,

    cloudinary: {
      CLOUDINARY_NAME: "saaditrips",
      CLOUDINARY_SECRET: "qx4QTUrGzm8F-l-xO7XWkmN-OwQ",
      CLOUDINARY_API: "765133522935454",
    },
    db: {
      username: "root",
      // DB_NAME: 'saaditrips',
      DB_NAME: "portfolio",
      // mongoUri: "mongodb://localhost:27017/",
      mongoUri: "mongodb+srv://Hassaan:Hassaan25@hemo.mykpap1.mongodb.net/",
    },
    EMAIL: "Saaditrips@gmail.com",
    PASSWORD: "12Haseeb@34",
    JWT_KEY: "saadiTrips",
  },
  production: {
    siteUrl: "https://dev.saaditrips.com",
    port: 3001,
    cloudinary: {
      CLOUDINARY_NAME: "saaditrips",
      CLOUDINARY_SECRET: "qx4QTUrGzm8F-l-xO7XWkmN-OwQ",
      CLOUDINARY_API: "765133522935454",
    },
    db: {
      username: "root",
      // DB_NAME: 'saaditrips',
      DB_NAME: "portfolio",
      mongoUri: "mongodb+srv://Hassaan:Hassaan25@hemo.mykpap1.mongodb.net/",
      // mongoUri:
      //   "mongodb://root:qpXQJ1c3nw986nPI@cluster0-shard-00-00-1os8p.mongodb.net:27017,cluster0-shard-00-01-1os8p.mongodb.net:27017,cluster0-shard-00-02-1os8p.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true",
    },
    EMAIL: "Saaditrips@gmail.com",
    PASSWORD: "12Haseeb@34",
    JWT_KEY: "saadiTrips",
  },
};

module.exports = config[env];
