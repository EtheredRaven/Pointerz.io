module.exports = function (Server) {
  Server.getCircuitsAndRecords = async function (socket, playerId) {
    let ret = await Server.CircuitModel.getCircuits(playerId);
    return ret;
  };

  Server.getVoteCircuits = async function (socket) {
    let voteCircuits = await Server.CircuitModel.getVoteCircuits(socket);
    return voteCircuits;
  };
};
