module.exports = function (Server) {
  Server.gameFunctions = require("../client/js/game/logic/Functions");
  Server.gameConstants = require("../client/js/game/logic/Constants");
  Server.Game = require("../client/js/game/logic/race/Race");
};
