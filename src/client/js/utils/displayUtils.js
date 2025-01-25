const Server = require("socket.io");

module.exports = function (Client) {
  // For ui purposes
  Client.getSupFromNumber = function (i) {
    return i == 1 || i == 21 || i == 31
      ? "st"
      : i == 2 || i == 22
      ? "nd"
      : i == 3 || i == 23
      ? "rd"
      : "th";
  };
};
