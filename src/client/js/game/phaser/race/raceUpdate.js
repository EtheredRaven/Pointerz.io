module.exports = function (Client) {
  Client.phaser.race.update = function () {
    if (!isRaceLoaded()) return;

    updatePlayersSprites();
    updateSvelteInterface();
  };

  let isRaceLoaded = function () {
    if (
      !Client.race.user ||
      !Client.race.game ||
      !Client.phaser.phaserInstance ||
      !Client.phaser.scene ||
      !Client.svelte
    ) {
      return false;
    }
    return true;
  };

  let updatePlayersSprites = function () {
    // Update the players graphics and show the sprite if the player has not ended yet
    Client.race.game.players.forEach((player) => {
      let createNewSpriteIfNoSprite = !player.ended;
      Client.phaser.race.updatePlayer(player, createNewSpriteIfNoSprite);
    });

    // Update the phantoms graphics
    Client.race.game.phantoms.forEach((phantom) => {
      // Simulate the phantoms positions and checkpoints according to the elasped time in the race
      Client.race.game.simulatePhantom(phantom);

      // Update the phantom sprites and create it if the user and the phantom have not ended yet
      let createNewSpriteIfNoSprite = !phantom.ended && !Client.race.user.ended;
      Client.phaser.race.updatePlayer(phantom, createNewSpriteIfNoSprite);
    });
  };

  let updateSvelteInterface = function () {
    // Update the user interface display (svelte)
    Client.svelte.updateRaceTime();

    let lastLapTime =
      Client.race.user.ended && Client.race.user.checkpointsCrossed.length
        ? Client.race.user.checkpointsCrossed[
            Client.race.user.checkpointsCrossed.length - 1
          ].instant
        : Client.race.user.currentInstant;
    Client.svelte.updateLapTimes(lastLapTime); // Update the current lap live time

    // Add a new lap if necessary
    if (
      Client.phaser.race.currentLap &&
      Client.phaser.race.currentLap != Client.race.user.currentLap
    ) {
      let previousLapTime =
        Client.race.user.checkpointsCrossed[
          Client.race.user.checkpointsCrossed.length - 1
        ].instant;
      Client.svelte.addNewLap(previousLapTime);
    }
    Client.phaser.race.currentLap = Client.race.user.currentLap;

    // Update the live ranking every three steps, not to put too much workload
    Client.phaser.race.updatingLiveRankingStep = !Client.phaser.race
      .updatingLiveRankingStep
      ? 1
      : Client.phaser.race.updatingLiveRankingStep + 1;
    if (!((Client.phaser.race.updatingLiveRankingStep - 1) % 3)) {
      Client.svelte.updateLiveRanking(Client.race.game.getRankedPlayers());
    }
  };
};
