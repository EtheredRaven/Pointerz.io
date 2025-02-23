module.exports = function (Client) {
  Client.socket.emitUpvoteCircuit = function (selectedCircuitId) {
    Client.socket.emit("upvote_circuit", selectedCircuitId);
  };

  Client.socket.getVoteCircuits = function () {
    Client.socket.emit("get_vote_circuits");
  };

  Client.registerEvent("circuit_upvoted", function (data) {
    Client.svelte.handleUpvoteResult(data);
  });

  Client.registerEvent("got_vote_circuits", function (data) {
    Client.svelte.updateLoadedVoteCircuits(data.voteCircuits);
    console.log(data);
  });
};
