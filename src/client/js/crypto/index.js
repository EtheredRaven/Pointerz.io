module.exports = function (Client) {
  require("./contracts")(Client);
  require("./wallet")(Client);
};
