module.exports = function (Client) {
  Client.socket.emitUpvoteCircuit = function (selectedCircuitId) {
    Client.socket.emit("upvote_circuit", selectedCircuitId);
  };

  Client.registerEvent("circuit_upvoted", function (data) {
    Client.svelte.handleUpvoteResult(data);
  });
};
