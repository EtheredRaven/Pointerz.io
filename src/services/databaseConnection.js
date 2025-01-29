module.exports = function (Server) {
  Server.mongoose = require("mongoose");
  Server.bcrypt = require("bcrypt");

  let databasePath = process.env.DB_URL
    ? process.env.DB_URL
    : "mongodb+srv://doadmin:7HmPD34od50yg298@pointerzdb-520578df.mongo.ondigitalocean.com/pointerz?authSource=admin&replicaSet=pointerzdb&tls=true&tlsCAFile=ca-certificate.crt";

  Server.mongoose
    .connect(databasePath, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => Server.infoLogging("Connection to database established"))
    .catch((err) =>
      Server.errorLogging("Connection to database failed", "", err)
    );
  Server.saltWorkFactor = 10;
  require("../models")(Server);
};
