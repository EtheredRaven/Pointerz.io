const Game = require("../../client/js/game/logic/race/Race");

module.exports = function (Server) {
  Server.loadCircuit = async function (
    circuitId,
    isEditedCircuit,
    isVoteCircuit
  ) {
    let circuitModel = isEditedCircuit
      ? Server.EditorCircuitModel
      : Server.CircuitModel;
    let selectedCircuit = await circuitModel.getCircuit(
      circuitId,
      null,
      !isVoteCircuit
    );
    let raceGame = new Game(Server, [], selectedCircuit.circuit);
    raceGame.dbCircuitModel = circuitModel;
    raceGame.currentCircuitModel.isEditedCircuit = isEditedCircuit;
    return raceGame;
  };

  Server.performEndRaceActions = async function (socket) {
    // Compare the current run time with the best one
    let runTime =
      socket.player.checkpointsCrossed[
        socket.player.checkpointsCrossed.length - 1
      ].instant;
    let bestRunTime =
      socket.userRecord && socket.userRecord.run
        ? socket.userRecord.run.runTime
        : Infinity;

    Server.infoLogging(
      "End race",
      socket,
      "success",
      Server.rooms[socket.roomId].currentCircuit._id,
      "Run time : " + runTime,
      "Personal record in " + bestRunTime
    );

    let isVoteCircuit =
      Server.rooms[socket.roomId].currentCircuit.campaignPublicationTime < 0;
    if (!isVoteCircuit && runTime < bestRunTime) {
      // If that's a new record
      let replay = {
        // The full replay
        _userId: socket.player._id,
        _circuitId: Server.rooms[socket.roomId].currentCircuitModel._id,
        nickname: socket.player.nickname,
        runTime: runTime,
        positions: socket.player.sucessivePositions,
        checkpointsCrossed: socket.player.checkpointsCrossed,
        nfts: socket.userModel.nfts.filter((nft) => nft.nftSelected),
      };
      let record = {
        // The record, ordered in the circuit object
        _id: Server.mongoose.Types.ObjectId(),
        _userId: socket.player._id,
        nickname: socket.player.nickname,
        runTime: runTime,
      };
      if (socket.loggedIn) {
        // Insert the new record
        let newRecord = await Server.rooms[
          socket.roomId
        ].dbCircuitModel.updateRecord(
          Server.rooms[socket.roomId].currentCircuitModel._id,
          record,
          replay,
          socket.userRecord
        );
        newRecord && (socket.userRecord = newRecord);
      } else {
        socket.userRecord = { run: { runTime: runTime } };
      }

      replay.nickname = "Best time";
      Server.emitNewPersonalRecord(socket, socket.userRecord, replay);
      Server.infoLogging(
        "New record",
        socket,
        "success",
        Server.rooms[socket.roomId].currentCircuit._id,
        "Record : " + runTime
      );
    }
    if (Server.rooms[socket.roomId]) {
      Server.rooms[socket.roomId].resetRace();
    }
  };
};
