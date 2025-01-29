module.exports = function (Server) {
  var express = require("express");
  Server.app = express();
  var httpServer = require("http").Server(Server.app);
  Server.io = require("socket.io")(httpServer);
  Server.listeningPort = 8081;
  Server.realHttpPort = process.env.PORT || Server.listeningPort;
  httpServer.listen(Server.realHttpPort, () => {});

  Server.infoLogging("Http server started", "", Server.realHttpPort);
};
