module.exports = function (Server) {
  // Send the race to the player
  Server.sendRaceData = function (socket, circuit, record, replays) {
    Server.emitToSocket("race_data", socket, [
      Server.rooms[socket.roomId].getPlayers(),
      socket.player._id,
      circuit,
      record,
      replays,
    ]);
  };

  // New player is connected
  Server.broadcastNewPlayer = function (socket) {
    Server.broadcastToRoom(
      "new_player_connected",
      socket.roomId,
      [socket.player],
      socket,
      () => Server.assertUserIsPlaying(socket)
    );
  };

  // A player left
  Server.broadcastPlayerLeft = function (socket) {
    Server.broadcastToRoom(
      "player_left",
      socket.roomId,
      [socket.player._id],
      socket,
      () => Server.assertUserIsPlaying(socket)
    );
  };

  Server.emitNewPersonalRecord = function (socket, record, replay) {
    Server.emitToSocket("new_record", socket, [record, replay]);
  };
};
