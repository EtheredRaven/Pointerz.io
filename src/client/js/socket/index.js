module.exports = function (Client) {
  // Socket connection
  Client.socket = io.connect();

  require("./user")(Client);
  require("./menu")(Client);
  require("./race")(Client);
  require("./editor")(Client);
  require("./vote")(Client);
  require("./crypto")(Client);

  // Disconnection
  window.addEventListener("beforeunload", function (event) {
    Client.socket.emit("disconnect");
  });
};
