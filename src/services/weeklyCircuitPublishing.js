const { Promise } = require("mongoose");

module.exports = function (Server) {
  let getWeekNumberSinceUNIX = function (timestamp) {
    return Math.floor(
      (timestamp + 1000 * 3600 * 24 * 3) / (1000 * 3600 * 24 * 7)
    );
  };
  Server.currentWeek = getWeekNumberSinceUNIX(Date.now());
  Server.checkAndPublishCircuitOfTheWeek = async function () {
    let currentWeek = getWeekNumberSinceUNIX(Date.now());
    if (Server.currentWeek != currentWeek) {
      Server.infoLogging("Trying to push publish circuit of the week");
      Server.currentWeek = currentWeek;
      let promises = [
        Server.UserModel.deleteCircuitVotes(),
        Server.CircuitModel.publishWinningCircuitAndDeleteAllVoteCircuits(),
      ];

      let result = await Promise.all(promises);
      let circuitOfTheWeek = result[1];
      if (circuitOfTheWeek) {
        Server.infoLogging(
          "Circuit of the week published",
          circuitOfTheWeek._id,
          circuitOfTheWeek.name
        );
      } else {
        Server.infoLogging("No circuit of the week found");
      }
    }
  };

  Server.circuitOfTheWeekTimeInterval = setInterval(
    Server.checkAndPublishCircuitOfTheWeek,
    1000 * 600
  );
};
