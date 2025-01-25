module.exports = function (Server, socket) {
  Server.registerEvent(socket, "upvote_circuit", function (circuitId) {
    Server.assertParametersExist({
      circuitId: circuitId,
    });
    Server.assertUserIsLoggedIn(socket);
    Server.upvoteCircuit(socket, circuitId);
  });
};
