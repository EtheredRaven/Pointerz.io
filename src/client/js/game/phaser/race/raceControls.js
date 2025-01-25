module.exports = function (Client) {
  Client.phaser.race.setDefaultControlState = function () {
    if (!Client.race.user) return;
    Client.race.user.setIsAccelerating(false);
    Client.race.user.setIsBraking(false);
    Client.race.user.setIsTurning(0);
  };

  Client.phaser.race.registerDiscreteControls = function () {
    let isInRace = function () {
      return (
        Client.race.user && Client.race.user.started && !Client.race.user.ended
      );
    };

    Client.phaser.addControlKeyPress("race", "H", 1000, () => {
      Client.race.user && Client.phaser.race.togglePhantomsVisility();
    });

    Client.phaser.addControlKeyPress("race", "ESC", 500, () => {
      if (!isInRace()) return;
      Client.race.toggleRacePause();
      Client.svelte.showEndraceMenu(Client.race.game.racePaused);
    });

    Client.phaser.addControlKeyPress("race", "DELETE", 500, () => {
      if (!isInRace()) return;
      Client.race.restart();
    });

    Client.phaser.addControlKeyPress("race", "BACKSPACE", 500, () => {
      if (!isInRace()) return;
      Client.race.goToLastCheckpoint();
    });

    Client.phaser.addControlKeyPress("race", "UP", 0, () => {
      isInRace() && Client.race.user.setIsAccelerating(true);
    });

    Client.phaser.addControlKeyPress("race", "DOWN", 0, () => {
      isInRace() && Client.race.user.setIsBraking(true);
    });

    Client.phaser.addControlKeyPress("race", "SHIFT", 0, () => {
      isInRace() && Client.race.user.setIsBraking(true);
    });

    Client.phaser.addControlKeyPress("race", "LEFT", 0, () => {
      isInRace() &&
        Client.race.user.setIsTurning(Client.race.user.isTurning - 1);
    });

    Client.phaser.addControlKeyPress("race", "RIGHT", 0, () => {
      isInRace() &&
        Client.race.user.setIsTurning(Client.race.user.isTurning + 1);
    });
  };
};
