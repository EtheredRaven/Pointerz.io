module.exports = function (Server, socket) {
  Server.registerRaceEvent = function (socket, eventName, cb, logIt = true) {
    Server.registerEvent(
      socket,
      eventName,
      function (...args) {
        Server.assertUserIsLoggedIn(socket, true);
        Server.assertUserIsPlaying(socket);
        cb(...args);
      },
      logIt
    );
  };

  // Creates a new room and joins it
  Server.registerEvent(
    socket,
    "create_or_join_new_room",
    async function (circuitId, isEditedCircuit = false, isVoteCircuit = false) {
      Server.assertParametersExist({
        circuitId: circuitId,
      });
      Server.assertUserIsLoggedIn(socket, true);
      let raceGame = await Server.loadCircuit(
        circuitId,
        isEditedCircuit,
        isVoteCircuit
      );
      if (raceGame.currentCircuit.isRaceReady()) {
        await Server.joinRoom(socket, await Server.createNewRoom(raceGame));
      } else {
        Server.emitErrorEvent(
          socket,
          "This circuit is not ready for race (no start or no end)."
        );
      }
    }
  );

  // Leave room
  Server.registerRaceEvent(socket, "leave_current_room", function () {
    Server.leaveCurrentRoom(socket);
  });

  // Simulates the new position of the player according to the inputs sent
  Server.registerRaceEvent(
    socket,
    "new_position",
    function (inputs) {
      Server.assertParametersExist({
        inputs: inputs,
      });
      Server.rooms[socket.roomId].simulatePlayer(socket.player, inputs);
    },
    false
  );

  // Go to the last checkpoint
  Server.registerRaceEvent(socket, "go_to_last_checkpoint", function () {
    socket.player.goToLastCheckpoint();
  });

  // Restart the whole race
  Server.registerRaceEvent(socket, "restart_race", function () {
    Server.rooms[socket.roomId].resetRace();
  });

  // When the player says he has ended his race
  Server.registerRaceEvent(socket, "race_ended", async function () {
    // Verify that the player has really ended his race
    if (!socket.player.ended) {
      throw new Error("The race has not ended yet");
    }
    Server.performEndRaceActions(socket);
  });
};
