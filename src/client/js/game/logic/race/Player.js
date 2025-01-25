var Functions = require("../Functions");
var Line = require("../circuit/components/Line");
const { Intersection } = require("kld-intersections");
const Constants = require("../Constants");
var ObjectID = require("bson").ObjectID;
const PlayerThrust = require("./PlayerThrust");
const PlayerWheel = require("./PlayerWheel");

class Player {
  constructor(data) {
    // External values
    this.updateInterval = data.updateInterval;
    this.currentCircuit = data.currentCircuit;

    // User
    this._id = data._id ? data._id : new ObjectID();
    this.nickname = data.nickname;
    this.nfts = data.nfts || [];

    // Spaceship sprite
    this.spritePoints = Constants.spaceship.spritePoints;
    this.scale = data.scale || Constants.spaceship.scale;
    /*this.hslColor = data.hslColor
      ? data.hslColor
      : {
          h: Math.floor(Math.random() * 360),
          s: 80,
          l: 80,
        };*/

    // Thrust anchor points
    this.thrustPoint = Constants.spaceship.thrustAnchorPoint;
    this.thrust = new PlayerThrust({
      scale: data.thrustScale || Constants.spaceship.thrustScale,
      thrustPoint: this.thrustPoint,
    });

    // Wheels anchor points
    this.wheels = [
      new PlayerWheel({ scale: this.scale, angle: 0 }),
      new PlayerWheel({ scale: this.scale, angle: 0 }),
      new PlayerWheel({ scale: this.scale, angle: 0 }),
    ];
    this.wheelsPoints = Constants.spaceship.wheelsAnchorPoints;

    this.wheelBase =
      (this.wheelsPoints[0].x - this.wheelsPoints[2].x) * this.scale;

    // Phantom case (additional variables, and some other are not used)
    this.isPhantom = data.isPhantom; // If this object is a phantom
    if (this.isPhantom) {
      this.liveCheckpointsCrossed = data.liveCheckpointsCrossed
        ? data.liveCheckpointsCrossed
        : [];
      Object.assign(this, data);
    }

    // Player current state
    this.x = data.x != undefined ? data.x : -500;
    this.y = data.y != undefined ? data.y : -500;
    this.vx = data.vx ? data.vx : 0;
    this.vy = data.vy ? data.vy : 0;
    this.angleSpeed = data.angleSpeed ? data.angleSpeed : 0;
    this.angle = data.angle ? data.angle : 0;
    this.currentEnvironmentType = data.currentEnvironmentType
      ? data.currentEnvironmentType
      : Constants.environments.SPACE;
    this.lastEnvironmentType = data.lastEnvironmentType
      ? data.lastEnvironmentType
      : 0;

    // Inputs
    this.isAccelerating =
      data.isAccelerating == undefined ? false : data.isAccelerating;
    this.isBraking = data.isBraking == undefined ? false : data.isBraking;
    this.isTurning = data.isTurning == undefined ? 0 : data.isTurning;
    this.driftPower = data.driftPower == undefined ? false : data.driftPower;

    // Other variables
    this.collidingSpeed = 0;
    this.inversedTurningRadius = 0;
    this.driftAdherenceFactor = 1;
  }

  // ENVIRONMENTS AND PHYSICS
  // Compute the spaceship behavioral constants according to the current environment
  computeCurrentEnvironmentConstants() {
    let physicsConstants =
      Constants.environmentPhysics[this.currentEnvironmentType];
    this.angleSpeedMax = physicsConstants.angleSpeedMax;
    this.halfAngleSpeedTime = physicsConstants.halfAngleSpeedTime;
    this.timeToStopFromHalfAngleSpeed =
      physicsConstants.timeToStopFromHalfAngleSpeed;
    this.vmax = physicsConstants.vmax;
    this.halfVmaxTime = physicsConstants.halfVmaxTime;
    this.timeToStopFromHalfSpeed = physicsConstants.timeToStopFromHalfSpeed;

    // Computing the constants (mathematics)
    this.angleDynamicFrictionRate = 0.693 / this.halfAngleSpeedTime;
    this.angleSolidFrictionRate =
      (this.angleDynamicFrictionRate * this.angleSpeedMax) /
      2 /
      (1 -
        Math.exp(
          -this.angleDynamicFrictionRate * this.timeToStopFromHalfAngleSpeed
        ));
    this.angleAccelerationForce =
      this.angleDynamicFrictionRate * this.angleSpeedMax +
      this.angleSolidFrictionRate;

    this.dynamicFrictionRate = 0.693 / this.halfVmaxTime;
    this.solidFrictionRate =
      (this.dynamicFrictionRate * this.vmax) /
      2 /
      (1 - Math.exp(-this.dynamicFrictionRate * this.timeToStopFromHalfSpeed));
    this.accelerationForce =
      this.dynamicFrictionRate * this.vmax + this.solidFrictionRate;
  }

  // Update the current environment of the spaceship // TODO -> optimize
  updateEnvironment(blocksQuad, environmentInitialization = false) {
    // An environment can be road or space
    this.lastEnvironmentType = this.currentEnvironmentType;

    let environmentFound = false;
    if (
      !this.currentEnvironment ||
      !this.currentEnvironment.points ||
      !Functions.isInside(this, this.currentEnvironment.points)
    ) {
      // If we are not anymore in the environment of last step
      // Look for the new one : can be optimised with another quadtree for the environments
      let collidingBlocks = blocksQuad.colliding({ x: this.x, y: this.y });
      if (collidingBlocks.length > 0) {
        this.currentEnvironment = collidingBlocks[0].block;
        this.currentEnvironmentType = this.currentEnvironment.environment;
        environmentFound = true;
      }

      // Default value
      if (!environmentFound) {
        this.currentEnvironmentType = Constants.environments.SPACE;
        this.currentEnvironment = {
          environment: this.currentEnvironmentType,
        };
      }
    }

    this.computeCurrentEnvironmentConstants();

    environmentInitialization &&
      (this.lastEnvironmentType = this.currentEnvironmentType);
  }

  // GETTERS

  getCurrentState() {
    let ret = {
      currentInstant: this.currentInstant,
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      angle: this.angle,
      points: Functions.getPoints(this),
      currentEnvironmentType: this.currentEnvironmentType,
      isTurning: this.isTurning,
      isAccelerating: this.isAccelerating,
      isBraking: this.isBraking,
      driftPower: this.driftPower,
    };
    if (this.thrust && this.thrust.cropRect) {
      ret.thrust = {
        cropRectX: this.thrust.cropRect[0],
        particlesEmitter: {
          on: this.thrust.particlesEmitter.on,
          x: this.thrust.particlesEmitter.x,
          y: this.thrust.particlesEmitter.y,
          scaleMin: this.thrust.particlesEmitter.scaleMin,
          scaleMax: this.thrust.particlesEmitter.scaleMax,
          XSpeedMax: this.thrust.particlesEmitter.XSpeedMax,
          YSpeedMax: this.thrust.particlesEmitter.YSpeedMax,
          XSpeedMin: this.thrust.particlesEmitter.XSpeedMin,
          YSpeedMin: this.thrust.particlesEmitter.YSpeedMin,
        },
      };
    }

    return ret;
  }

  getPlayerLinesShape(points, delta = { x: 0, y: 0 }) {
    let ret = [];
    let lastPoint = points[points.length - 1];
    let currentPoint;
    for (let i = 0; i < points.length; i++) {
      currentPoint = points[i];
      ret.push(
        new Line({
          x1: lastPoint.x - delta.x,
          y1: lastPoint.y - delta.y,
          x2: currentPoint.x - delta.x,
          y2: currentPoint.y - delta.y,
        })
      );
      lastPoint = currentPoint;
    }
    return ret;
  }

  getThrustAnchorPoint() {
    return Functions.getPoint(this, this.thrustPoint);
  }

  getWheelsAnchorPoints() {
    let res = [];
    this.wheels.forEach((wheel, i) => {
      res.push(Functions.getPoint(this, this.wheelsPoints[i]));
    });
    return res;
  }

  // SETTERS
  setCurrentState(pos) {
    this.setAngle(pos.angle);
    this.setX(pos.x);
    this.setY(pos.y);
    this.setIsAccelerating(pos.isAccelerating);
    this.setIsBraking(pos.isBraking);
    this.setIsTurning(pos.isTurning);
    this.setDriftPower(pos.driftPower);
    this.setCurrentEnvironmentType(pos.currentEnvironmentType);

    if (this.isPhantom) {
      this.thrustEffects = pos.thrust;
    }
  }

  setPoint(i, x, y) {
    let p = typeof i === "object" ? i : this.spritePoints[i];
    this.setX(
      x -
        this.scale * p.x * Math.cos(this.angle) +
        this.scale * p.y * Math.sin(this.angle)
    );
    this.setY(
      y -
        this.scale * p.x * Math.sin(this.angle) -
        this.scale * p.y * Math.cos(this.angle)
    );
  }

  setCurrentEnvironmentType(type) {
    this.currentEnvironmentType = type;
  }

  setAngleSpeed(angleSpeed) {
    this.angleSpeed = Functions.roundToPrecision(angleSpeed);
  }

  setAngle(newAngle) {
    newAngle = (newAngle + 2 * Math.PI) % (2 * Math.PI);
    this.angle = Functions.roundToPrecision(newAngle);
    this.thrust.angle =
      (newAngle - (this.isTurning * Math.PI) / 16 + 2 * Math.PI) %
      (2 * Math.PI);

    let wheelsAnchorPoints = this.getWheelsAnchorPoints();
    this.wheels.forEach((wheel, i) => {
      wheel.x = wheelsAnchorPoints[i].x;
      wheel.y = wheelsAnchorPoints[i].y;
      if (i < 2) {
        let rawWheelAngle = Math.atan(
          this.wheelBase * this.inversedTurningRadius
        );
        let wheelAngle =
          (Math.sign(rawWheelAngle) *
            Math.pow(Math.abs(rawWheelAngle) / (Math.PI / 4), 0.5)) /
          2;
        wheel.angle = this.angle + wheelAngle;
      }
    });
  }

  setVx(newVx) {
    this.vx = Functions.roundToPrecision(newVx);
  }

  setVy(newVy) {
    this.vy = Functions.roundToPrecision(newVy);
  }

  setX(newX) {
    if (newX <= 0 || newX >= Constants.gameWidth - 1) {
      this.setVx(0);
    }
    this.x = Functions.roundToPrecision(
      Math.min(Math.max(0, newX), Constants.gameWidth - 1)
    );
    this.thrust.x = this.getThrustAnchorPoint().x;

    let wheelsAnchorPoints = this.getWheelsAnchorPoints();
    this.wheels.forEach((wheel, i) => {
      wheel.x = wheelsAnchorPoints[i].x;
    });
  }

  setY(newY) {
    if (newY <= 0 || newY >= Constants.gameHeight - 1) {
      this.setVy(0);
    }
    this.y = Functions.roundToPrecision(
      Math.min(Math.max(0, newY), Constants.gameHeight - 1)
    );
    this.thrust.y = this.getThrustAnchorPoint().y;

    let wheelsAnchorPoints = this.getWheelsAnchorPoints();
    this.wheels.forEach((wheel, i) => {
      wheel.y = wheelsAnchorPoints[i].y;
    });
  }

  setIsAccelerating(newIsAccelerating) {
    this.isAccelerating =
      newIsAccelerating && !this.speedPenaltyCurrentIndex ? true : false;
  }

  setIsBraking(newIsBraking) {
    this.isBraking = newIsBraking;
  }

  setIsTurning(newIsTurning) {
    this.isTurning = Math.max(-1, Math.min(1, newIsTurning));
  }

  setDriftPower(newDriftPower) {
    this.driftPower = newDriftPower || 0;
  }

  setNFTs(nfts) {
    this.nfts = nfts ? [...nfts] : [];
  }

  // RACE
  startRace() {
    this.started = true;
  }

  // Compute the movement of this player for this step according to the forces and inputs
  computeStepMovement(collidingObjects) {
    let msTimeDiff = Constants.updatingRate;
    this.currentInstant += msTimeDiff;
    let sTimeDiff = msTimeDiff / 1000;

    if (this.goToLastCPNextStep) {
      // If the reset has to the last cp has been trigerred by the user
      let lastCp = this.checkpointsCrossed[this.checkpointsCrossed.length - 1];
      this.reset(lastCp.respawn, false);
      this.goToLastCPNextStep = false;
    } else {
      this.computePlayerForces(collidingObjects, sTimeDiff); // Forces relative to the thrust and else

      // Position and speed increment and then collisions
      this.incrementSpeed(sTimeDiff);
      this.incrementPosition(sTimeDiff);
      this.collideWithObjects(collidingObjects);

      // Turning and checking collisions then another time : collisions cannot be checked in one time if two succcessive movements (striaght movement and turning)
      let lastPosition = this.getCurrentState();
      this.turn(sTimeDiff);
      this.collideWithObjects(
        collidingObjects,
        this.getCurrentState(),
        lastPosition
      );

      if (this.speedPenaltyCurrentIndex) {
        // If there is a speed penalty due to a collisiojn, the user cannot accelerate
        this.speedPenaltyCurrentIndex =
          (this.speedPenaltyCurrentIndex + 1) % Constants.speedPenaltyDuration;
      }
    }
  }

  computePlayerForces(collidingObjects, timeDiff) {
    // Computing basic forces (inputs of the player)
    let rotatingForce =
      Math.sign(this.isTurning) *
      this.angleAccelerationForce *
      (this.currentEnvironmentType == Constants.environments.ROAD ? 0 : 1); // Depends on the environment
    let additionalRotationForce = 0;
    let basicForce =
      (this.isAccelerating ? this.accelerationForce : 0) -
      (this.isBraking
        ? Constants.brakingRelativeForce * this.accelerationForce
        : 0);
    let playerForce = {
      x: basicForce * Math.cos(this.angle),
      y: basicForce * Math.sin(this.angle),
    };

    // Rotating force on road due to the turning radius
    this.angleRotationDueToTurningRadius = 0;
    if (this.currentEnvironmentType == Constants.environments.ROAD) {
      let currentSpeedNorm = this.getSpeedNorm();
      let interpolationFactor = Math.pow(
        currentSpeedNorm / this.vmax,
        Constants.roadTurningRadiusInterpolationFactor
      );
      let targetInversedTurningRadius =
        this.isTurning /
        (Constants.minRoadTurningRadius +
          (Constants.maxRoadTurningRadius - Constants.minRoadTurningRadius) *
            interpolationFactor);
      if (this.inversedTurningRadius != targetInversedTurningRadius) {
        let isInferiorToTarget =
          this.inversedTurningRadius < targetInversedTurningRadius;
        let newInversedTurningRadius =
          this.inversedTurningRadius +
          (isInferiorToTarget ? 1 : -1) *
            Constants.inversedRoadTurningRadiusIncrement;
        if (isInferiorToTarget) {
          newInversedTurningRadius = Math.min(
            newInversedTurningRadius,
            targetInversedTurningRadius
          );
        } else {
          newInversedTurningRadius = Math.max(
            newInversedTurningRadius,
            targetInversedTurningRadius
          );
        }
        this.inversedTurningRadius = newInversedTurningRadius;
      }

      this.angleRotationDueToTurningRadius =
        this.inversedTurningRadius * currentSpeedNorm * timeDiff;
    }

    // Boost, additional force
    if (this.boostCounter) {
      this.boostCounter = (this.boostCounter + 1) % Constants.boostDuration;
      playerForce.x +=
        Constants.boostRelativeForce *
        this.accelerationForce *
        Math.cos(this.boostAngle);
      playerForce.y +=
        Constants.boostRelativeForce *
        this.accelerationForce *
        Math.sin(this.boostAngle);
    }

    // Thrust interacting with wall, additional force
    if (
      this.currentEnvironmentType == Constants.environments.SPACE &&
      this.isAccelerating
    ) {
      let bestLine = null; // The closest line
      let bestForce = 0; // the force associated with it being in interaction with the thrust
      this.thrust.intersectionPoints = [];
      this.thrust.intersectedLine = null;

      let collidedLines = Functions.getCollidedObjects(
        collidingObjects,
        this.thrust,
        true
      ); // What object is interacting with the thrust
      collidedLines.forEach((line) => {
        if (line.blockType == Constants.blockTypes.SOLID) {
          // Only solid lines
          this.thrust.intersectionPoints = [
            ...this.thrust.intersectionPoints,
            ...line.preciseIntersectionPoints,
          ];
          this.thrust.intersectedLine = line; // We only need one of the intersected lines for thrust particles behavior

          let thrustAnchor = Functions.getPoint(
            this.thrust,
            this.thrust.spritePoints[0]
          ); // The point of the spaceship where the thrust is attached
          line.intersectionPoints.forEach((intersection) => {
            // Take the greatest force !
            let proximityFactor = Math.pow(
              Math.max(
                0,
                this.thrust.getThrustWidth() -
                  Functions.distance(thrustAnchor, intersection)
              ) / this.thrust.getThrustWidth(),
              Constants.thrustDriftProximityFactorPower
            );
            let additionalForce =
              Constants.thrustDriftRelativeForce *
              this.accelerationForce *
              proximityFactor;
            if (additionalForce > bestForce) {
              bestForce = additionalForce;
              bestLine = line;

              additionalRotationForce =
                rotatingForce *
                Constants.thrustDriftAdditionRotationRelativeForce *
                proximityFactor;
            }
          });
        }
      });
      if (bestLine) {
        playerForce.x += bestForce * Math.cos(this.angle);
        playerForce.y += bestForce * Math.sin(this.angle);
      }
    }

    this.movingForce = playerForce;
    this.rotatingForce = rotatingForce + additionalRotationForce;
  }

  // Increment the position
  incrementPosition(timeDiff) {
    this.setX(this.x + this.vx * timeDiff);
    this.setY(this.y + this.vy * timeDiff);
  }

  incrementSpeed(timeDiff) {
    let speedNorm = Functions.norm(this.vx, this.vy);
    if (speedNorm > 0) {
      this.setVx(
        Math.sign(this.vx) *
          Math.max(
            Math.abs(this.vx) -
              ((this.solidFrictionRate * Math.abs(this.vx)) / speedNorm +
                this.dynamicFrictionRate * Math.abs(this.vx)) *
                timeDiff,
            0
          )
      );

      this.setVy(
        Math.sign(this.vy) *
          Math.max(
            Math.abs(this.vy) -
              ((this.solidFrictionRate * Math.abs(this.vy)) / speedNorm +
                this.dynamicFrictionRate * Math.abs(this.vy)) *
                timeDiff,
            0
          )
      );
    }

    // Specific behavior on road : drifting and adherence
    this.driftAdherenceFactor = Math.max(
      1,
      this.driftAdherenceFactor - Constants.driftAdherenceTransitionIncrement
    );
    let isDrifting = false;
    if (this.currentEnvironmentType == Constants.environments.ROAD) {
      // Adherence to the road
      let axisToProjectSpeed = {
        x: Math.cos(this.angle),
        y: Math.sin(this.angle),
      };
      let scalarProduct = Functions.scalarProduct(
        this.getSpeedVector(),
        axisToProjectSpeed
      );
      let projectedSpeed = {
        x: axisToProjectSpeed.x * scalarProduct,
        y: axisToProjectSpeed.y * scalarProduct,
      };
      let remainingSpeed = {
        x: this.vx - projectedSpeed.x,
        y: this.vy - projectedSpeed.y,
      };

      // Project speed to the spaceship axis, but keep a part of the tangential speed if the player is braking to allow drifting

      this.isBraking &&
        (this.driftAdherenceFactor = Constants.driftAdherenceFactor);
      this.speedPenaltyCurrentIndex &&
        (this.driftAdherenceFactor =
          1 + Constants.driftAdherenceTransitionIncrement * 0.5);
      let canDrift = this.driftAdherenceFactor > 1;
      let projectedSpeedCoef = canDrift ? this.driftAdherenceFactor : 1;
      let remainingSpeedCoef = canDrift ? 1 : 0;
      let newSpeed = {
        x:
          projectedSpeed.x * projectedSpeedCoef +
          remainingSpeed.x * remainingSpeedCoef,
        y:
          projectedSpeed.y * projectedSpeedCoef +
          remainingSpeed.y * remainingSpeedCoef,
      };
      let speedNormBefore = this.getSpeedNorm();
      let speedNormAfter = Functions.norm(newSpeed.x, newSpeed.y);
      let speedNormRatio =
        speedNormAfter > 0 ? speedNormBefore / speedNormAfter : 0;
      this.setVx(canDrift ? newSpeed.x * speedNormRatio : newSpeed.x);
      this.setVy(canDrift ? newSpeed.y * speedNormRatio : newSpeed.y);

      // Check if the player is really drifting
      let isGoingForward = scalarProduct > 0;
      let angleDiff = Functions.getAngleDiff(
        this.angle,
        Math.atan2(this.vy, this.vx)
      );
      this.driftPower = 0;

      // Drifting
      isDrifting =
        canDrift &&
        !this.speedPenaltyCurrentIndex &&
        Math.abs(angleDiff) > Constants.driftStartingAngle &&
        isGoingForward;
      if (isDrifting) {
        let reductedBrakingForce = {
          x:
            Constants.driftReductedBrakingForce *
            this.accelerationForce *
            Math.cos(this.angle),
          y:
            Constants.driftReductedBrakingForce *
            this.accelerationForce *
            Math.sin(this.angle),
        };
        this.movingForce.x += reductedBrakingForce.x;
        this.movingForce.y += reductedBrakingForce.y;

        this.rotatingForce +=
          Math.sign(this.isTurning) *
          this.angleAccelerationForce *
          Constants.driftAdditionalRotatingForce;

        let speedNorm = Functions.norm(this.vx, this.vy);
        let speedVector = {
          x: this.vx / speedNorm,
          y: this.vy / speedNorm,
        };
        let speedProjection = Functions.scalarProduct(speedVector, {
          x: Math.cos(this.angle),
          y: Math.sin(this.angle),
        });
        this.driftPower = Math.max(0, Math.min(speedProjection));
      }
    }

    this.setVx(this.vx + this.movingForce.x * timeDiff);
    this.setVy(this.vy + this.movingForce.y * timeDiff);
  }

  // This function find the collisions and put the spaceship to the right place
  collideWithObjects(collidingObjects, currentPosition, lastPosition) {
    let collidingLines = this.computeCollidingLines(
      collidingObjects,
      currentPosition,
      lastPosition
    ); // Get the lines collided
    let firstCollision = this.getFirstSolidElementCollided(collidingLines); // Get the first line collided
    this.doCollisionBehavior(firstCollision); // Put the spaceship at the right place according to this collision
    this.updateSpecialLinesCrossed(
      collidingLines,
      currentPosition,
      lastPosition
    ); // Compute the checkpoints, boosts and other behavior
  }

  // Get the lines colliding with the spaceship
  computeCollidingLines(
    collidingObjects,
    currentPosition = this.getCurrentState(),
    lastPosition = this.sucessivePositions.length > 0
      ? this.sucessivePositions[this.sucessivePositions.length - 1]
      : this.getCurrentState()
  ) {
    let currentBoundingBox = Functions.getBoundingBox(currentPosition.points); // The current position of the player
    let lastBoundingBox = Functions.getBoundingBox(lastPosition.points); // The last step position
    // We will use the lines between drawn by each set of (last position, current position) points composing the spaceship to know where it intersects the lines

    let collidingLines = collidingObjects.colliding(
      Functions.getCombinedBoundingBox(currentBoundingBox, lastBoundingBox), // Combine into the bigger one
      (playerCollided, obstacleLine) => {
        let obstacleLineShape = obstacleLine.shapeInfo;
        let intersected = false;

        obstacleLine.intersectionInfo = [];

        // If a player point (summit) crosses an obstacle line
        for (let i = 0; i < currentPosition.points.length; i++) {
          let playerMovingPoint = new Line({
            x1: lastPosition.points[i].x,
            y1: lastPosition.points[i].y,
            x2: currentPosition.points[i].x,
            y2: currentPosition.points[i].y,
          });
          let playerMovingPointShape = playerMovingPoint.shapeInfo;

          let computedIntersection = Intersection.intersect(
            playerMovingPointShape,
            obstacleLineShape
          );

          if (computedIntersection.points.length > 0) {
            intersected = true;
            obstacleLine.intersectionInfo.push({
              playerPoint: currentPosition.points[i],
              obstaclePoint: computedIntersection.points[0],
              intersectionCoordinates: computedIntersection.points[0],
              movingPoint: playerMovingPoint,
              crossedLine: obstacleLine,
            });
          }
        }

        // If a block point crosses a player line
        obstacleLine.points.forEach((obstaclePoint) => {
          let obstacleMovingPointLine = new Line({
            x1: obstaclePoint.x - lastPosition.x + currentPosition.x,
            y1: obstaclePoint.y - lastPosition.y + currentPosition.y,
            x2: obstaclePoint.x,
            y2: obstaclePoint.y,
          }); // The referential is now the spaceship
          let obstacleMovingPointShape = obstacleMovingPointLine.shapeInfo;
          let playerLines = this.getPlayerLinesShape(currentPosition.points);

          playerLines.forEach((playerLine) => {
            let playerLineShape = playerLine.shapeInfo;
            let computedIntersection = Intersection.intersect(
              obstacleMovingPointShape,
              playerLineShape
            );
            if (computedIntersection.points.length > 0) {
              intersected = true;
              let intersectionRealCoordinates = {
                x: computedIntersection.points[0].x,
                y: computedIntersection.points[0].y,
              };
              obstacleLine.intersectionInfo.push({
                playerPoint: intersectionRealCoordinates,
                obstaclePoint: obstaclePoint,
                intersectionCoordinates: intersectionRealCoordinates,
                movingPoint: obstacleMovingPointLine,
                crossedLine: playerLine,
                inversedMovement: true,
              });
            }
          });
        });

        return intersected;
      }
    );

    return collidingLines;
  }

  // Get the first element collided of a group of collided elements
  getFirstSolidElementCollided(collidingLines) {
    let maxMovingDistance = 0;
    let firstCollision;
    collidingLines.forEach((line) => {
      line.intersectionInfo.forEach((intersection) => {
        // We have all the collisions, let's compute the first one
        if (line.blockType == Constants.blockTypes.SOLID) {
          let computedVx =
            (intersection.inversedMovement ? -1 : 1) *
            (intersection.movingPoint.x2 - intersection.movingPoint.x1);
          let computedVy =
            (intersection.inversedMovement ? -1 : 1) *
            (intersection.movingPoint.y2 - intersection.movingPoint.y1);
          let speedNorm = Functions.norm(computedVx, computedVy);
          let diffX =
            intersection.playerPoint.x -
            intersection.obstaclePoint.x +
            computedVx / speedNorm;
          let diffY =
            intersection.playerPoint.y -
            intersection.obstaclePoint.y +
            computedVy / speedNorm;

          let totalMovingDistance = Functions.norm(diffX, diffY);
          if (totalMovingDistance > maxMovingDistance) {
            maxMovingDistance = totalMovingDistance;
            firstCollision = intersection;
            firstCollision.coordinatesDifferences = {
              diffX: diffX,
              diffY: diffY,
            };
          }
        }
      });
    });

    return firstCollision;
  }

  // Place the spaceship at the right position and bounce it
  doCollisionBehavior(
    firstCollision,
    currentPosition = this.getCurrentState()
  ) {
    if (firstCollision) {
      // If there is indeed a collision
      // Put the spaceship at the right position just before the collision
      this.setX(
        currentPosition.x - firstCollision.coordinatesDifferences.diffX
      );
      this.setY(
        currentPosition.y - firstCollision.coordinatesDifferences.diffY
      );

      let normalVector = firstCollision.crossedLine.getNormalVector();
      let tangentVector = firstCollision.crossedLine.getTangentVector();

      let xSpeed =
        ((firstCollision.movingPoint.x2 - firstCollision.movingPoint.x1) *
          1000) /
        this.updateInterval;
      let ySpeed =
        ((firstCollision.movingPoint.y2 - firstCollision.movingPoint.y1) *
          1000) /
        this.updateInterval;

      // Separate the current speed into a tangential (in direction of the collided line) a normal vectors
      let scalarNormal = Functions.scalarProduct(normalVector, {
        x: xSpeed,
        y: ySpeed,
      });
      let scalarTangent = Functions.scalarProduct(tangentVector, {
        x: xSpeed,
        y: ySpeed,
      });
      let coefNormal =
        Math.sign(-scalarNormal) *
        Math.max(
          Math.abs(
            Constants.remainingSpeedAfterCollision.normal * scalarNormal
          ),
          Constants.remainingSpeedAfterCollision.minNormal
        );

      // The colliding speed is the speed of the spaceship in the direction of the wall, with half of the tangential speed
      this.collidingSpeed =
        Math.abs(scalarNormal) + Math.abs(scalarTangent) / 2;

      // Compute the new speed vectors in this tangential, normal base
      let normalSpeed = {
        x: coefNormal * normalVector.x,
        y: coefNormal * normalVector.y,
      };
      let tangentSpeed = {
        x:
          Constants.remainingSpeedAfterCollision.tangential *
          scalarTangent *
          tangentVector.x,
        y:
          Constants.remainingSpeedAfterCollision.tangential *
          scalarTangent *
          tangentVector.y,
      };

      // Set the real speed in x, y coordinates
      this.setVx(
        (firstCollision.inversedMovement ? -1 : 1) *
          (normalSpeed.x + tangentSpeed.x)
      );
      this.setVy(
        (firstCollision.inversedMovement ? -1 : 1) *
          (normalSpeed.y + tangentSpeed.y)
      );

      this.speedPenaltyCurrentIndex = 1; // Speed penalty if a wall has been hit
    }
  }

  // What checkpoints have been crossed during the last movement
  updateSpecialLinesCrossed(
    collidingLines,
    currentPosition = this.getCurrentState(),
    lastPosition = this.sucessivePositions.length > 0
      ? this.sucessivePositions[this.sucessivePositions.length - 1]
      : this.getCurrentState()
  ) {
    collidingLines.forEach((line) => {
      if (
        line.blockType != Constants.blockTypes.CHECKPOINT &&
        line.blockType != Constants.blockTypes.END &&
        line.blockType != Constants.blockTypes.MULTILAP &&
        line.blockType != Constants.blockTypes.BOOST
      ) {
        // Only take into account the right line types
        return;
      }
      let firstIntersection = {};
      line.intersectionInfo.forEach((intersection) => {
        // For each point of intersection between the spaceship and the line
        // If it is a checkpoint, we need the exact timing at which the line is crossed, we compute it
        if (
          line.blockType == Constants.blockTypes.CHECKPOINT ||
          line.blockType == Constants.blockTypes.END ||
          line.blockType == Constants.blockTypes.MULTILAP
        ) {
          let posOnLine =
            Functions.distance(
              intersection.intersectionCoordinates,
              intersection.movingPoint.points[1]
            ) /
            Functions.distance(
              intersection.movingPoint.points[0],
              intersection.movingPoint.points[1]
            );
          let intersectionTime =
            currentPosition.currentInstant -
            posOnLine *
              (currentPosition.currentInstant - lastPosition.currentInstant);
          intersection.time = intersectionTime;
          if (
            firstIntersection.time == undefined ||
            (firstIntersection.time != undefined &&
              firstIntersection.time > intersectionTime)
          ) {
            firstIntersection = intersection; // Get the first intersection for this line (the first time the spaceship cross the line)
          }
        } else if (line.blockType == Constants.blockTypes.BOOST) {
          // If that's a boost, initialize it
          this.boostAngle = line.parentRotationAngle;
          this.boostCounter = 1;
        }
      });

      // Once it is done, we update the checkpoints crossed
      let currentLapCheckpoints = this.checkpointsCrossed.filter(
        (cp) => this.currentLap == cp.currentLap
      );
      if (
        (line.blockType == Constants.blockTypes.CHECKPOINT || // If that's a checkpoint
          ((line.blockType == Constants.blockTypes.END ||
            line.blockType == Constants.blockTypes.MULTILAP) && // Or the end line and all other checkpoints have been crossed
            currentLapCheckpoints.length ==
              this.currentCircuit.blocksNumber[
                Constants.blockTypes.CHECKPOINT
              ])) &&
        !currentLapCheckpoints.find((el) => el.checkpointId == line.blockId) // And that is has not been crossed yet during this lap
      ) {
        this.checkpointsCrossed.push({
          blockType: line.blockType,
          checkpointId: line.blockId,
          instant: firstIntersection.time,
          currentLap: this.currentLap,
          respawn: {
            angle: line.parentRotationAngle,
            x: (line.x1 + line.x2) / 2,
            y: (line.y1 + line.y2) / 2,
          }, // Start position if reset at this cp
        }); // Then cross this new cp
        if (
          line.blockType == Constants.blockTypes.END ||
          line.blockType == Constants.blockTypes.MULTILAP
        ) {
          // If that's the end mark of the race
          if (this.currentLap < this.currentCircuit.lapsNumber) {
            // New lap
            this.currentLap++;
          } else {
            // Or race is really ended
            this.ended = true;
          }
        }
      }
    });
  }

  // Step turning of the spaceship according to angle speed
  turn(timeDiff) {
    let isGoingForward =
      this.isGoingForward() ||
      this.currentEnvironmentType == Constants.environments.SPACE;
    this.setAngleSpeed(
      Math.sign(this.angleSpeed) *
        Math.max(
          Math.abs(this.angleSpeed) -
            (this.angleSolidFrictionRate +
              this.angleDynamicFrictionRate * Math.abs(this.angleSpeed)) *
              timeDiff,
          0
        )
    );

    this.setAngleSpeed(
      this.angleSpeed +
        (isGoingForward ? 1 : -1) * this.rotatingForce * timeDiff
    );
    this.setAngle(this.angle + this.angleSpeed * timeDiff);

    if (this.currentEnvironmentType == Constants.environments.ROAD) {
      this.setAngle(
        this.angle +
          (isGoingForward ? 1 : -1) * this.angleRotationDueToTurningRadius
      );
    }
  }

  goToLastCheckpoint() {
    if (this.checkpointsCrossed.length > 0) {
      this.goToLastCPNextStep = true;
    }
  }

  reset(start, restartRace = true) {
    if (!this.isPhantom) {
      this.setAngle(start.angle);
      this.setPoint(this.spritePoints[0], start.x, start.y);
      this.setVx(0);
      this.setVy(0);
      this.setAngleSpeed(0);
      this.speedPenaltyCurrentIndex = 0;
      this.boostCounter = 0;
      this.inversedTurningRadius = 0;
      this.driftAdherenceFactor = 1;
      if (restartRace) {
        this.currentInstant = 0;
        delete this.checkpointsCrossed;
        delete this.liveCheckpointsCrossed;
      }
    }
    if (restartRace) {
      this.sucessivePositions = []; // List of positions step by step
      this.checkpointsCrossed = this.isPhantom ? this.checkpointsCrossed : []; // For phantoms, this is the whole list of cps with times
      this.liveCheckpointsCrossed = this.isPhantom
        ? []
        : this.checkpointsCrossed; // Cps crossed at the time of this race
      this.ended = false;
      this.started = false;
      this.dontEmit = false; // No more update to the server (0.5s after ending line crossed)
      this.currentLap = 1;
    }
  }

  getSpeedVector() {
    return { x: this.vx, y: this.vy };
  }

  getSpeedNorm() {
    return Functions.norm(this.vx, this.vy);
  }

  getMaxSpeed() {
    return this.vmax;
  }

  getSelectedNFTs() {
    let res = {};
    for (let category in Constants.defaultNFTs) {
      let selectedNFT = this.nfts.find(
        (nft) => nft.nftCategory == category && nft.nftSelected
      );
      res[category] = selectedNFT
        ? selectedNFT
        : Constants.defaultNFTs[category];
    }
    return res;
  }

  getSelectedNFT(category) {
    let selectedNFT = this.nfts.find(
      (nft) => nft.nftCategory == category && nft.nftSelected
    );
    return selectedNFT ? selectedNFT : Constants.defaultNFTs[category];
  }

  isGoingForward() {
    return (
      Functions.scalarProduct(this.getSpeedVector(), {
        x: Math.cos(this.angle),
        y: Math.sin(this.angle),
      }) >= 0
    );
  }

  // Spaceship color
  /*color(h = this.hslColor.h, s = this.hslColor.s, l = this.hslColor.l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return [toHex(r), toHex(g), toHex(b)];
  }

  colorHexInt(hexArray = []) {
    if (hexArray.length == 0) {
      hexArray = this.color();
    }
    return parseInt(`0x${hexArray[0]}${hexArray[1]}${hexArray[2]}`);
  }

  colorHex() {
    let hexArray = this.color();
    return `#${hexArray[0]}${hexArray[1]}${hexArray[2]}`;
  }*/

  // Misc
  completeId() {
    return this.nickname + "@" + this._id;
  }
}

module.exports = Player;
