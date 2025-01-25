module.exports = function (Client) {
  require("./init")(Client);
  require("./preload")(Client);
  require("./update")(Client);
};
