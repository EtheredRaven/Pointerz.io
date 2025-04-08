module.exports = function (Server) {
  Server.upvoteCircuit = async function (socket, circuitId) {
    let emitReturnEvent = Server.initReturnEvent(
      Server.emitCircuitUpvoted,
      socket,
      "Circuit upvote / downvote"
    );

    let ret = await Server.UserModel.upvoteCircuit(socket, circuitId);
    ret
      ? emitReturnEvent({
          data: {
            isUpvoted: ret.isUpvoted,
            newCircuitModel: ret.result[0],
            newUserModel: ret.result[1],
          },
        })
      : emitReturnEvent({ retError: "Error upvoting circuit" });
  };
};
