module.exports = function (Server) {
  Server.rooms = {};

  // Create a new room
  Server.createNewRoom = async function (raceGame) {
    let roomId = Server.mongoose.Types.ObjectId();
    Server.rooms[roomId] = raceGame;
    Server.infoLogging(
      "Create room",
      "success",
      raceGame.currentCircuit._id,
      roomId
    );

    return roomId;
  };

  // Join a room
  Server.joinRoom = async function (s, roomId) {
    // Verify that everything exists
    if (!s.userModel || !roomId || !Server.rooms[roomId]) {
      return;
    }

    // Join the room
    s.roomId = roomId;
    s.join(roomId);

    // Load the records and the phantoms
    s.userRecord = await Server.rooms[s.roomId].dbCircuitModel.getUserRecord(
      s.userModel._id,
      Server.rooms[s.roomId].currentCircuitModel._id
    );
    s.replays = await Server.rooms[
      s.roomId
    ].dbCircuitModel.getUserReplayAndPhantoms(
      s.userRecord,
      Server.rooms[s.roomId].currentCircuitModel
    );

    // Player is created
    s.player = Server.rooms[s.roomId].createPlayer({
      nickname: s.userModel.username,
      nfts: s.userModel.nfts,
      room: s.roomId,
      _id: s.userModel ? s.userModel._id : undefined,
    });

    // Announce it to the others
    Server.broadcastNewPlayer(s);

    // Initialize the client's game
    Server.sendRaceData(
      s,
      Server.rooms[s.roomId].currentCircuitModel,
      s.userRecord,
      s.replays
    );

    Server.infoLogging("Join room", "success", s, s.roomId);
  };

  // Leave the current room
  Server.leaveCurrentRoom = function (s) {
    Server.broadcastPlayerLeft(s);

    Server.rooms[s.roomId].deletePlayer(s.player);
    if (Server.rooms[s.roomId].players.length == 0) {
      Server.rooms[s.roomId] = undefined;
      Server.infoLogging("Delete room", "success", s.roomId);
    }
    s.leave(s.roomId);

    Server.infoLogging("Leave current room", "success", s, s.roomId);
    s.roomId = undefined;
  };
};
