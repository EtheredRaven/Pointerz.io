module.exports = function (Server) {
  Server.getCircuitsAndRecords = async function (
    socket,
    playerId,
    updateSocket = true
  ) {
    let ret = await Server.CircuitModel.getCircuits(playerId);

    if (updateSocket) {
      socket.loadedCircuits = ret.circuits;
      socket.loadedRecords = ret.records;
    }

    return ret;
  };

  Server.getVoteCircuits = async function (socket) {
    let voteCircuits = await Server.CircuitModel.getVoteCircuits(socket);
    return voteCircuits;
  };
};
