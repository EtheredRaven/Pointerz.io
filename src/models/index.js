module.exports = function (Server) {
  require("./CircuitModel")(Server);
  require("./EditorCircuitModel")(Server);
  require("./ReplayModel")(Server);
  require("./UserModel")(Server);
  require("./NftModel")(Server);
};
