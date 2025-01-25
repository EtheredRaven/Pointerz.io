module.exports = function (Client) {
  Client.phaser.preload = function (visualiser = false) {
    // Spaceship
    this.load.image("spaceship", "assets/images/spaceships/spaceship.png");
    this.load.image("wheel", "assets/images/spaceships/wheel.png");
    this.load.image("thrust", "assets/images/spaceships/thrust.png");
    this.load.image("particle", "assets/images/spaceships/particle.png");

    if (!visualiser) {
      // Blocks
      this.load.image("boost", "assets/images/blocks/boost.png");
      this.load.image("grid", "assets/images/blocks/grid.png");
      this.load.image("checkpoint", "assets/images/blocks/checkpoint.png");

      // Circuit images (non-block)
      this.load.image("arrow", "assets/images/circuitImages/arrow.png");

      // Load the sounds
      this.load.audio(
        "mainsoundtrack",
        "assets/sounds/music/mainsoundtrack.mp3"
      );
      Client.NUMBER_OF_SOUNDTRACKS = 12;
      for (let i = 1; i <= Client.NUMBER_OF_SOUNDTRACKS; i++) {
        this.load.audio(
          "soundtrack" + i,
          "assets/sounds/music/soundtrack" + i + ".mp3"
        );
      }

      // Load the sound effects

      // UI / Menu
      this.load.audio("buttonClick", "assets/sounds/ui/buttonClick.ogg");
      this.load.audio(
        "buttonSelection",
        "assets/sounds/ui/buttonSelection.ogg"
      );
      this.load.audio(
        "backButtonClick",
        "assets/sounds/ui/backButtonClick.ogg"
      );
      this.load.audio("warningWindow", "assets/sounds/ui/warningWindow.ogg");
      this.load.audio("cancelClick", "assets/sounds/ui/cancelClick.ogg");
      this.load.audio("checking", "assets/sounds/ui/checking.ogg");
      this.load.audio("info", "assets/sounds/ui/info.ogg");
      this.load.audio("error", "assets/sounds/ui/error.ogg");

      // Editor
      this.load.audio(
        "blockSelection",
        "assets/sounds/editor/blockSelection.ogg"
      );
      this.load.audio(
        "blockPlacement",
        "assets/sounds/editor/blockPlacement.ogg"
      );
      this.load.audio(
        "blockModification",
        "assets/sounds/editor/blockModification.ogg"
      );
      this.load.audio(
        "blockDeletion",
        "assets/sounds/editor/blockDeletion.ogg"
      );
      this.load.audio(
        "menuSelection",
        "assets/sounds/editor/menuSelection.ogg"
      );
      this.load.audio(
        "blockSeparation",
        "assets/sounds/editor/blockSeparation.ogg"
      );

      // Race
      this.load.audio("raceStart", "assets/sounds/race/raceStart.ogg");
      this.load.audio("raceCountdown", "assets/sounds/race/raceCountdown.ogg");
      this.load.audio("checkpoint", "assets/sounds/race/checkpoint.ogg");
      this.load.audio("engine", "assets/sounds/race/engine.ogg");
      this.load.audio(
        "spaceshipThrust",
        "assets/sounds/race/spaceshipThrust.ogg"
      );
      this.load.audio(
        "highPitchSpaceshipThrust",
        "assets/sounds/race/highPitchSpaceshipThrust.ogg"
      );
      this.load.audio("transition", "assets/sounds/race/transition.ogg");
      this.load.audio("raceEnded", "assets/sounds/race/raceEnded.ogg");
      this.load.audio("wallCrash", "assets/sounds/race/wallCrash.ogg");
      this.load.audio("boost", "assets/sounds/race/boost.ogg");
      this.load.audio("drift", "assets/sounds/race/drift.ogg");
    }
  };
};
