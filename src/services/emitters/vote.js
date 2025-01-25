module.exports = function (Server) {
  Server.emitCircuitUpvoted = function (socket, data) {
    Server.emitToSocket("circuit_upvoted", socket, [data]);
  };
};
