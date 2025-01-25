module.exports = function (Client) {
  require("./raceInit")(Client);
  require("./raceControls")(Client);
  require("./raceActions")(Client);
  require("./raceUpdate")(Client);
  require("./playerGraphics")(Client);
};
