module.exports = function (Server) {
  // New user arrives on index.html, he triggers the connection
  Server.io.on("connection", function (socket) {
    Server.initSocketLogging(socket);
    Server.infoLogging("User connected", socket);
    require("./users")(Server, socket);
    require("./race")(Server, socket);
    require("./data")(Server, socket);
    require("./editor")(Server, socket);
    require("./vote")(Server, socket);

    // Disconnection
    Server.registerEvent(
      socket,
      "disconnect",
      function () {
        Server.leaveCurrentRoom(socket, false);
        Server.infoLogging("User disconnected", socket);
      },
      false
    );
  });
};
