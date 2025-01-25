const Player = require("./Player");
const PlayersManagment = require("./PlayersManagment");
const Circuit = require("../circuit/Circuit");
const Constants = require("../Constants");
const Functions = require("../Functions");
const Quadtree = require("quadtree-lib");

class Game {
  // a Game is an object managing all the other objects
  constructor(parentObject, players, circuit) {
    this.creationDate = Date.now();
    this.parentObject = parentObject; // Either server or client

    this.players = [];
    this.phantoms = []; // Non-players spaceships
    this.width = Constants.gameWidth;
    this.height = Constants.gameHeight;

    this.currentCircuitModel = circuit; // The raw data model
    this.loadCircuit(circuit); // Create the real object (currentCircuit)

    this.playersQuad = new Quadtree({
      width: this.width,
      height: this.height,
    }); // Collisions tree
    PlayersManagment(this, Player); // Specific players functions
    this.loadPlayers(players); // Load the players

    this.resetRace();

    // Updating tick
    this.updateInterval = Constants.updatingRate;
    this.updatingFunction = this.parentObject.isClient
      ? setInterval(() => this.updateFunction(), this.updateInterval)
      : undefined; // Only the client have an update function, the server only computes when the client send his inputs
  }

  // Stop the game
  delete() {
    clearInterval(this.updatingFunction);
  }

  // Reset the different variables
  resetRace() {
    // Race states
    this.raceEnded = false;
    this.racePaused = false;

    // Set the players at the start
    this.players.forEach((player) => {
      player.reset(this.currentCircuit.start);
      player.updateEnvironment(this.currentCircuit.blocksQuad, true);
    });
    this.phantoms.forEach((phantom) => {
      phantom.reset();
    });

    // Init the UI and starting counter
    if (this.parentObject.svelte) {
      this.parentObject.svelte.startRaceCounter();
      this.parentObject.svelte.initLapsNumber(this.currentCircuit.lapsNumber);
    }
  }

  // Update the players
  updateFunction() {
    if (
      this.parentObject.race.user &&
      this.parentObject.race.user.started &&
      !this.racePaused
    ) {
      this.simulatePlayer(this.parentObject.race.user);
    }
  }

  // Simulate a non-player spaceship
  simulatePhantom(phantom) {
    // Simulate the checkpoints crossed
    let nextCheckpointToCross =
      phantom.liveCheckpointsCrossed.length < phantom.checkpointsCrossed.length
        ? phantom.checkpointsCrossed[phantom.liveCheckpointsCrossed.length]
        : undefined;
    if (
      nextCheckpointToCross &&
      nextCheckpointToCross.instant <=
        this.parentObject.race.user.currentInstant
    ) {
      phantom.liveCheckpointsCrossed.push(nextCheckpointToCross);
      if (
        phantom.liveCheckpointsCrossed.length ==
        phantom.checkpointsCrossed.length
      ) {
        phantom.ended = true;
      }
    }

    // Update the data (positions and else)
    let pos =
      phantom.positions[
        Math.min(
          Math.max(
            0,
            this.parentObject.race.user.sucessivePositions.length - 1
          ),
          phantom.positions.length - 1
        )
      ];
    phantom.setCurrentState(pos);
  }

  // Simulate a player
  simulatePlayer(player, playerInputs) {
    let currentState = player.getCurrentState();
    if (player.sucessivePositions.length > 0) {
      // Update the player inputs thanks to what is given by the client (playerInputs only exists if its the server)
      if (this.parentObject.isServer && playerInputs) {
        ["isTurning", "isAccelerating", "isBraking", "driftPower"].forEach(
          (attr) => {
            player["set" + Functions.capitalizeFirstLetter(attr)](
              playerInputs[attr]
            );
          }
        );
      }

      // Compute the physics and the new positions
      player.updateEnvironment(this.currentCircuit.blocksQuad);
      player.computeStepMovement(this.currentCircuit.linesQuad);
      currentState = player.getCurrentState();

      // Sounds

      if (this.parentObject.isClient) {
        if (player.collidingSpeed) {
          this.parentObject.phaser.playSound(
            "wallCrash",
            Math.max((1.75 * player.collidingSpeed) / player.getMaxSpeed(), 0.3)
          );
        }
        player.collidingSpeed = 0;

        if (player.boostCounter == 1) {
          this.parentObject.phaser.playSound("boost");
        }

        if (player.driftPower) {
          this.parentObject.phaser.playDriftSound();
        } else {
          this.parentObject.phaser.stopDriftSound();
        }
      }

      // Logging / tests
      if (
        playerInputs &&
        (currentState.currentInstant != playerInputs.currentInstant ||
          currentState.x != playerInputs.x ||
          currentState.y != playerInputs.y ||
          currentState.angle != playerInputs.angle ||
          currentState.vx != playerInputs.vx ||
          currentState.vy != playerInputs.vy)
      ) {
        console.log(
          new Date().toTimeString() +
            " : Client / server synch error for player " +
            player.completeId()
        );
      }

      // Race ended for the local player : to change for real multiplayer (TODO)
      if (this.parentObject.isClient && player.ended && !this.raceEnded) {
        this.raceEnded = true;
        setTimeout(() => {
          player.dontEmit = true;
          this.parentObject.socket.emitRaceEnded();
        }, 800);
      }
    }

    // Update the thrust
    if (!currentState.thrust && playerInputs) {
      currentState.thrust = playerInputs.thrust;
    }
    player.sucessivePositions.push(currentState);

    // Emit the new position if that's the client
    if (this.parentObject.isClient && !player.dontEmit) {
      this.parentObject.socket.emitNewPosition(currentState);
    }
  }

  // Circuit loading
  loadCircuit(circuit) {
    this.currentCircuit = new Circuit(circuit);
    this.currentCircuit.initCircuit();
  }

  // Load all the phantoms and return the user one
  loadPhantoms(phantoms) {
    let userReplay = undefined;
    phantoms.forEach((ph) => {
      let possibleUserReplay = this.addPhantom(ph);
      userReplay = possibleUserReplay ? possibleUserReplay : userReplay;
    });
    return userReplay;
  }

  // Add a phantom and return it if it's the user one
  addPhantom(phantom) {
    phantom.isPhantom = true;
    this.phantoms.push(new Player(phantom));
    if (
      phantom._userId.toString() == this.parentObject.race.user._id.toString()
    ) {
      return phantom;
    }
  }

  // Add the phantom of the local player
  addPlayerPhantom(phantom) {
    // Delete the previous phantoms for this player
    for (let i = 0; i < this.phantoms.length; i++) {
      let ph = this.phantoms[i];
      if (ph._userId.toString() == this.parentObject.race.user._id.toString()) {
        this.parentObject.phaser.race.deletePlayer(ph, 0, true);
        this.phantoms.splice(i, 1);
      }
    }
    // Add the new one
    return this.addPhantom(phantom);
  }
}

module.exports = Game;
