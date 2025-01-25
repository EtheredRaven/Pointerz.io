module.exports = function (Client) {
  const MIN_LOADING_TIME = 1000;

  // Initialize the race
  Client.race.initialize = function (
    players,
    playerId,
    circuit,
    record,
    replays
  ) {
    let startingMoment = performance.now();

    // Create the game object / physic engine with the data given by the server
    let Race = require("../logic/race/Race");
    Client.race.game = new Race(Client, players, circuit);
    Client.race.user = Client.race.game.getPlayer(playerId);
    Client.race.user.isCurrentPlayer = true; // Identify the user player instance

    // Load the ennemies replays and store the user one (if it exists)
    Client.race.user.record = record;
    if (replays) {
      Client.race.user.replay = Client.race.game.loadPhantoms(replays);
    }

    Client.phaser.isInEditorMode = false;
    Client.phaser.drawCircuit(Client.race.game.currentCircuit); // Draw the circuit
    Client.phaser.race.reset();
    Client.phaser.reset();
    Client.svelte.updateEndraceRecord(); // Update the end-race record display (svelte)

    setTimeout(() => {
      Client.svelte.setRaceLoading(false);
    }, Math.max(0, MIN_LOADING_TIME - (performance.now() - startingMoment)));
  };

  // Stop the race and erase everything
  Client.race.stop = function () {
    Client.phaser.clear();
    Client.race.game.delete();
    Client.race.game = undefined;
    Client.race.user = undefined;
    Client.socket.emitLeaveCurrentRoom();
  };

  // Restart the current race
  Client.race.restart = function () {
    Client.race.game.resetRace();
    Client.phaser.race.reset(false);
    Client.socket.emitRestartRace();
  };

  // Go to the last checkpoint
  Client.race.goToLastCheckpoint = function () {
    Client.race.user.goToLastCheckpoint();
    Client.socket.emitGoToLastCheckpoint();
  };

  Client.race.setRacePause = function (racePauseSet) {
    Client.race.game.racePaused = racePauseSet;
  };

  Client.race.toggleRacePause = function () {
    Client.race.game.racePaused
      ? Client.phaser.resumeEngineSounds()
      : Client.phaser.pauseEngineSounds();
    Client.race.setRacePause(!Client.race.game.racePaused);
  };

  Client.race.updateNewRecord = function (record, replay) {
    Client.race.user.record = record;
    Client.race.user.replay = Client.race.game.addPlayerPhantom(replay);
    Client.svelte.updateEndraceRecord();
    Client.race.game && Client.race.game.currentCircuit.runs.push({});
    Client.svelte.updateCircuitValidatedState &&
      Client.svelte.updateCircuitValidatedState(true);
  };
};
