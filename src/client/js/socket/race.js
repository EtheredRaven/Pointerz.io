module.exports = function (Client) {
  // Getting the info for the new race and init displaying and logic
  Client.registerEvent(
    "race_data",
    function (players, playerId, circuit, record, replays) {
      Client.race.initialize(players, playerId, circuit, record, replays);
    }
  );

  // New phantom associated with the new record
  Client.registerEvent("new_record", function (record, replay) {
    Client.assertRaceIsInitialized();
    Client.race.updateNewRecord(record, replay);
  });

  // New player to add
  Client.registerEvent("new_player_connected", function (newPlayer) {
    Client.assertRaceIsInitialized();
    Client.race.game.addPlayer(newPlayer);
  });

  // A player left
  Client.registerEvent("player_left", function (_id) {
    Client.assertRaceIsInitialized();
    Client.race.game.deletePlayer(Client.race.game.getPlayer(_id));
  });

  Client.socket.emitJoinNewRoom = function (...params) {
    Client.socket.emit("create_or_join_new_room", ...params);
  };

  Client.socket.emitLeaveCurrentRoom = function () {
    Client.socket.emit("leave_current_room");
  };

  Client.socket.emitRestartRace = function () {
    Client.socket.emit("restart_race");
  };

  Client.socket.emitGoToLastCheckpoint = function () {
    Client.socket.emit("go_to_last_checkpoint");
  };

  Client.socket.emitNewPosition = function (currentState) {
    Client.socket.emit("new_position", currentState);
  };

  Client.socket.emitRaceEnded = function () {
    Client.socket.emit("race_ended");
  };
};
