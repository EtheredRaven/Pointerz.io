module.exports = function (Server) {
  require("./data")(Server);
  require("./race")(Server);
  require("./users")(Server);
  require("./editor")(Server);
  require("./vote")(Server);
};
