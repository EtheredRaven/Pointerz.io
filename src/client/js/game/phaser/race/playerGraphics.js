const Constants = require("../../logic/Constants");

module.exports = function (Client) {
  Client.phaser.race.createPlayer = function (
    player,
    phaserScene = Client.phaser.scene
  ) {
    // If there is really no sprite at all
    if (!player.sprite) {
      // The thrust
      player.thrust.sprite = Client.phaser.createSprite(
        {
          x: player.x,
          y: player.y,
          originX: 1,
          originY: 0.5,
          name: "thrust",
          scale: player.thrust.scale,
          depth: Client.phaser.LAYERS_DEPTHS?.PLAYERS_THRUSTS || 0,
        },
        phaserScene
      );

      // The thrust crop when hitting the wall
      player.thrust.cropRect = [
        0,
        0,
        player.thrust.spriteWidth,
        player.thrust.spriteHeight,
      ];
      player.thrust.sprite.setCrop(...player.thrust.cropRect);

      // The thrust particles
      player.thrust.particlesManager = phaserScene.add.particles("particle");
      player.thrust.particlesManager.setDepth(
        Client.phaser.LAYERS_DEPTHS?.PLAYERS_THRUSTS || 0
      );
      player.thrust.particlesEmitter =
        player.thrust.particlesManager.createEmitter({
          x: player.x,
          y: player.y,
          quantity: 2,
          blendMode: "ADD",
          rotation: 0,
          lifespan: 1000,
          frequency: 10,
          alpha: { start: 1, end: 0 },
        });
      player.thrust.particlesEmitter.stop();

      // The wheels
      player.wheels.forEach((wheel) => {
        wheel.sprite = Client.phaser.createSprite(
          {
            x: player.x,
            y: player.y,
            angle: player.angle,
            originX: 0.5,
            originY: 0.5,
            name: "wheel",
            scale: wheel.scale,
            depth: Client.phaser.LAYERS_DEPTHS?.PLAYERS_THRUSTS || 0,
          },
          phaserScene
        );
      });

      // The real spaceship
      player.sprite = Client.phaser.createSprite(
        {
          x: player.x,
          y: player.y,
          originX: 0.5,
          originY: 0.5,
          name: "spaceship",
          scale: player.scale,
          depth: Client.phaser.LAYERS_DEPTHS?.PLAYERS || 1,
          // tint: player.colorHexInt(),
        },
        phaserScene
      );

      Client.phaser.updateNFTs(player, phaserScene);

      // The player's name
      player.nicknameText = phaserScene.add.text(
        player.x,
        player.y,
        player.nickname,
        {
          font: "16px 'Nunito'",
          fill: "white",
          align: "center",
        }
      );
      player.nicknameText.setOrigin(0.5, 0);
      player.nicknameText.setColor("#DBDBDB"); // player.colorHex()
      player.nicknameText.setDepth(
        Client.phaser.LAYERS_DEPTHS?.PLAYERS_NICKNAMES || 2
      );

      // Tell the camera to follow this player if it's the one of the user
      if (Client.race.user == player) {
        phaserScene.cameras.main.startFollow(player.sprite);
      }
    }

    Client.phaser.race.resetPlayerGraphics(player);
  };

  Client.phaser.updateNFTs = function (
    player,
    phaserScene = Client.phaser.scene
  ) {
    const selectedNFTs = player.getSelectedNFTs();
    const texturesToLoad = [];

    // Prepare texture loading data
    Object.entries(selectedNFTs).forEach(([category, nft]) => {
      if (!nft.isDefault) {
        const nftKey = `nft_${nft.nftName}`;
        const nftPath = `assets/images/spaceships/${category}/${nft.nftName}.png`;

        if (!phaserScene.textures.exists(nftKey)) {
          texturesToLoad.push({ key: nftKey, path: nftPath, category });
        }
      }
    });

    let applyNFTs = function () {
      // Handle Body NFT with mask
      if (!selectedNFTs.Body.isDefault) {
        const bodyKey = `nft_${selectedNFTs.Body.nftName}`;
        if (!player.nftBodyMask) {
          player.nftBodyMask = phaserScene.make.image({
            x: player.x,
            y: player.y,
            key: "spaceship",
            scale: player.scale,
            origin: { x: 0.5, y: 0.5 },
            add: false,
          });
        }
        player.sprite.setTexture(bodyKey);
        player.sprite.setMask(player.nftBodyMask.createBitmapMask());
      } else {
        player.sprite.setTexture("spaceship");
        player.sprite.setMask(null);
        player.nftBodyMask = undefined;
      }

      // Handle Flame NFT - simple texture swap
      if (!selectedNFTs.Flame.isDefault) {
        const flameKey = `nft_${selectedNFTs.Flame.nftName}`;
        player.thrust.sprite.setTexture(flameKey);
      } else {
        player.thrust.sprite.setTexture("thrust");
      }

      // Handle Wheels NFT - simple texture swap
      if (!selectedNFTs.Wheels.isDefault) {
        const wheelKey = `nft_${selectedNFTs.Wheels.nftName}`;
        player.wheels.forEach((wheel) => wheel.sprite.setTexture(wheelKey));
      } else {
        player.wheels.forEach((wheel) => wheel.sprite.setTexture("wheel"));
      }
    };

    // Load all new textures at once
    if (texturesToLoad.length > 0) {
      texturesToLoad.forEach(({ key, path }) => {
        phaserScene.load.image(key, path);
      });

      phaserScene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        applyNFTs();
      });

      phaserScene.load.start();
    } else {
      applyNFTs();
    }
  };

  Client.phaser.race.resetPlayerGraphics = function (player) {
    if (!player.sprite || !player.nicknameText || !player.thrust.sprite) {
      return;
    }
    player.sprite.isInDeletingAnimation = false;
    player.sprite.visible = true;
    player.sprite.alpha = 1;
    player.nicknameText.visible = 1;
    player.nicknameText.alpha = 1;
    player.thrust.sprite.visible = 1;
    player.thrust.sprite.alpha =
      player.currentEnvironmentType == Client.race.Constants.environments.SPACE
        ? 1
        : 0;
    player.wheels.forEach((wheel) => {
      wheel.sprite.visible = 1;
      wheel.sprite.alpha =
        player.currentEnvironmentType == Client.race.Constants.environments.ROAD
          ? 1
          : 0;
    });
  };

  Client.phaser.race.updatePlayer = function (
    player,
    createNewSpriteIfNoSprite = true,
    phaserScene = Client.phaser.scene,
    isVisualiser = false
  ) {
    if (!player.sprite) {
      if (!createNewSpriteIfNoSprite) {
        return;
      }
      Client.phaser.race.createPlayer(player, phaserScene);
    }

    updatePlayerSpaceship(player);
    updatePlayerNickname(player);

    // Compute the particles and the crop
    let isUser = !player.isPhantom;
    let shouldUpdateUserThrustEffects =
      player.currentEnvironmentType ==
        Client.race.Constants.environments.SPACE &&
      player.thrust.sprite.visible &&
      player.thrust.intersectionPoints &&
      player.thrust.intersectionPoints.length >= 1;
    if (isUser && shouldUpdateUserThrustEffects) {
      updateUserThrustEffects(player);
    } else if (player.isPhantom && player.thrust.sprite.visible) {
      updatePhantomThrustEffects(player);
    } else {
      // Else, default is no crop and emitter turned off
      player.thrust.cropRect[0] = 0;
      player.thrust.particlesEmitter.on = false;
    }

    // Update the computed crop and the rotation
    player.thrust.sprite.setCrop(...player.thrust.cropRect);
    Client.phaser.updateSpriteRotation(player.thrust, 0.25);

    // Opacity functions
    if (!player.sprite.isInDeletingAnimation) {
      !isVisualiser && updatePhantomOpacityAccordingToUserProximity(player);
      updateThrustTransition(player, isVisualiser);
      updateWheelsTransition(player, isVisualiser);
    }

    if (!isVisualiser) {
      // Sound effects
      if (isUser) {
        // Play the engine sound
        let speed = player.getSpeedNorm();
        if (player.currentEnvironmentType == Constants.environments.ROAD) {
          Client.phaser.stopSpaceshipThrustSound();
          Client.phaser.playEngineSound(speed, player.getMaxSpeed() || 0);
          if (player.lastEnvironmentType == Constants.environments.SPACE) {
            Client.phaser.playSound("transition");
          }
        } else if (
          player.currentEnvironmentType == Constants.environments.SPACE
        ) {
          // If the player is in space, the engine sound is not played
          Client.phaser.stopEngineSound();
          if (player.isAccelerating || player.boostCounter) {
            Client.phaser.playSpaceshipThrustSound(
              2 *
                Math.sqrt(
                  player.thrust.cropRect[0] / player.thrust.preciseSpriteWidth
                )
            );
          } else {
            Client.phaser.stopSpaceshipThrustSound();
          }
          if (player.lastEnvironmentType == Constants.environments.ROAD) {
            Client.phaser.playSound("transition");
          }
        }
      }

      // Hide phantoms or not
      let isPhantom = Client.race.user != player;
      if (isPhantom) {
        updatePhantomVisbilityAccordingToUserSetting(player);
      }

      // Drift marks
      if (!player.driftPoints) {
        player.driftPoints = [];
      }

      if (player.driftPower) {
        let driftDrawer = isPhantom
          ? Client.phaser.globalDrawers.phantomsDriftMarks
          : Client.phaser.globalDrawers.driftMarks;
        driftDrawer.lineStyle(
          5,
          Client.phaser.DRIFT_MARKS_COLOR,
          player.driftPower
        );

        let wheels = player.getWheelsAnchorPoints();
        let currentPoint = { x: wheels[2].x, y: wheels[2].y };

        player.driftPoints.push(currentPoint);
        if (player.driftPoints.length > 3) {
          player.driftPoints.shift();
        }

        if (player.driftPoints.length >= 2) {
          driftDrawer.strokePoints(player.driftPoints);
        }
      } else {
        // Reset points when not drifting
        player.driftPoints = [];
      }

      // Delete the sprite if it has ended its race and it's not already in deleting animation
      if (player.ended && !player.sprite.isInDeletingAnimation) {
        Client.phaser.race.deletePlayer(
          player,
          Client.phaser.race.PLAYERS_FADEOUT_DURATION
        );
      }
    }
  };

  let updatePlayerSpaceship = function (player) {
    // Update spaceship
    player.sprite.x = player.x;
    player.sprite.y = player.y;
    player.sprite.rotation = player.angle;

    if (player.nftBodyMask) {
      player.nftBodyMask.setPosition(player.x, player.y);
      player.nftBodyMask.setRotation(player.angle);
    }

    // Update the wheels
    player.wheels.forEach((wheel, i) => {
      wheel.sprite.x = wheel.x;
      wheel.sprite.y = wheel.y;
      if (i < 2) {
        // Only the two front wheels are turning
        Client.phaser.updateSpriteRotation(wheel, 0.25);
      } else {
        wheel.sprite.rotation = player.angle;
      }
    });

    // Random movement / scale of the thrust fire
    player.thrust.sprite.x = player.thrust.x;
    player.thrust.sprite.y = player.thrust.y;
    let boostScale = player.boostCounter ? 1.2 : 1; // When there is a boost, its bigger
    player.thrust.sprite.setScale(
      player.thrust.scale *
        boostScale *
        Math.max(
          0.9,
          Math.min(
            1.1,
            (Math.random() * 0.2 + 0.9) *
              (player.thrust.sprite.scaleX / player.thrust.scale)
          )
        ),
      player.thrust.scale *
        Math.max(
          0.9,
          Math.min(
            1.1,
            (Math.random() * 0.1 + 0.95) *
              (player.thrust.sprite.scaleY / player.thrust.scale)
          )
        )
    );
  };

  let updatePlayerNickname = function (player) {
    // Update nickname
    player.nicknameText.x = player.x;
    player.nicknameText.y = player.y + Client.phaser.race.NICKNAME_Y_POSITION;
  };

  let updateUserThrustEffects = function (player) {
    // Compute the furthest intersection point on the thrust line and the average middle of the intersection
    let origin = player.getThrustAnchorPoint();
    let thrustLine = player.thrust.getThrustLine();
    let maxScalar = 0;
    let avgX = 0;
    let avgY = 0;
    player.thrust.intersectionPoints.forEach((point) => {
      avgX += point.x;
      avgY += point.y;
      let scalar = Client.race.Functions.scalarProduct(thrustLine, {
        x: point.x - origin.x,
        y: point.y - origin.y,
      });
      if (scalar > maxScalar) {
        maxScalar = scalar;
      }
    });
    avgX /= player.thrust.intersectionPoints.length;
    avgY /= player.thrust.intersectionPoints.length;

    // Put the particles emitter in the middle of the intersections
    player.thrust.particlesEmitter.on = true;
    player.thrust.particlesEmitter.setPosition(avgX, avgY);

    // Compute the speed and directions of the emitted particles
    let tangentIntersected = player.thrust.intersectedLine.getTangentVector();
    let normalIntersected = player.thrust.intersectedLine.getNormalVector();
    let sideSign = Client.race.Functions.scalarProduct(
      normalIntersected,
      thrustLine
    );
    normalIntersected.x = -sideSign * normalIntersected.x;
    normalIntersected.y = -sideSign * normalIntersected.y;
    let particleNormalSpeed = Client.race.Functions.linearInterpolation(
      0,
      player.thrust.getPreciseThrustWidth(),
      60,
      20,
      maxScalar
    );
    player.thrust.particlesEmitter.XSpeedMin =
      -80 * Math.abs(tangentIntersected.x) +
      particleNormalSpeed * normalIntersected.x;
    player.thrust.particlesEmitter.XSpeedMax =
      80 * Math.abs(tangentIntersected.x) +
      particleNormalSpeed * normalIntersected.x;
    player.thrust.particlesEmitter.YSpeedMin =
      -80 * Math.abs(tangentIntersected.y) +
      particleNormalSpeed * normalIntersected.y;
    player.thrust.particlesEmitter.YSpeedMax =
      80 * Math.abs(tangentIntersected.y) +
      particleNormalSpeed * normalIntersected.y;
    player.thrust.particlesEmitter.setSpeedX({
      min: player.thrust.particlesEmitter.XSpeedMin,
      max: player.thrust.particlesEmitter.XSpeedMax,
    });
    player.thrust.particlesEmitter.setSpeedY({
      min: player.thrust.particlesEmitter.YSpeedMin,
      max: player.thrust.particlesEmitter.YSpeedMax,
    });

    // Compute the size of the emitted particles
    let particleSize = Client.race.Functions.linearInterpolation(
      0,
      player.thrust.getPreciseThrustWidth(),
      0.04,
      0.007,
      maxScalar
    );
    player.thrust.particlesEmitter.scaleMin = particleSize * 0.5;
    player.thrust.particlesEmitter.scaleMax = particleSize;
    player.thrust.particlesEmitter.setScale({
      min: player.thrust.particlesEmitter.scaleMin,
      max: player.thrust.particlesEmitter.scaleMax,
    });

    // Update the crop rect to match the furthest intersection
    player.thrust.cropRect[0] = Math.max(
      0,
      player.thrust.preciseSpriteWidth -
        Client.race.Functions.norm(player.thrustPoint.x, player.thrustPoint.y) -
        maxScalar / player.thrust.sprite.scaleX +
        Client.phaser.ROAD_SOLID.WIDTH / 2 / player.scale
    );
  };

  let updatePhantomThrustEffects = function (player) {
    // If that's phantom, everything is precomputed and the emitter and crop only needs to be updated
    player.thrust.particlesEmitter.on =
      player.thrustEffects.particlesEmitter.on;

    player.thrust.cropRect[0] = player.thrustEffects.cropRectX;
    player.thrust.particlesEmitter.setSpeedX({
      min: player.thrustEffects.particlesEmitter.XSpeedMin,
      max: player.thrustEffects.particlesEmitter.XSpeedMax,
    });
    player.thrust.particlesEmitter.setSpeedY({
      min: player.thrustEffects.particlesEmitter.YSpeedMin,
      max: player.thrustEffects.particlesEmitter.YSpeedMax,
    });
    player.thrust.particlesEmitter.setScale({
      min: player.thrustEffects.particlesEmitter.scaleMin,
      max: player.thrustEffects.particlesEmitter.scaleMax,
    });
    player.thrust.particlesEmitter.setPosition(
      player.thrustEffects.particlesEmitter.x,
      player.thrustEffects.particlesEmitter.y
    );
  };

  let updatePhantomOpacityAccordingToUserProximity = function (player) {
    // If it is close to the user, it need to be transparent
    if (player != Client.race.user) {
      let alpha = Math.min(
        0.85,
        Math.max(
          0,
          Client.race.Functions.distance(player, Client.race.user) / 150
        )
      );
      player.sprite.alpha = alpha;
      player.nicknameText.alpha = alpha;
    }
  };

  let updateThrustTransition = function (player, isVisualiser = false) {
    // Update the thrust opacity according to wether it is accelerating
    let thrustAlpha = Math.max(player.thrust.sprite.alpha - 0.07, 0); // Default : it disappears
    if (
      (player.isAccelerating || player.boostCounter || isVisualiser) &&
      player.currentEnvironmentType == Client.race.Constants.environments.SPACE
    ) {
      // If it is accelerating (or boost) and that's in space, then show the thrust
      thrustAlpha = Math.min(player.thrust.sprite.alpha + 0.07, 1);
    }
    player.thrust.sprite.alpha = Math.min(thrustAlpha, player.sprite.alpha);
  };

  let updateWheelsTransition = function (player, isVisualiser = false) {
    // Update the wheels opactity according to the current environment
    player.wheels.forEach((wheel) => {
      let alpha = Math.min(wheel.sprite.alpha + 0.07, 1);
      if (
        player.currentEnvironmentType != Client.race.Constants.environments.ROAD
      ) {
        alpha = Math.max(wheel.sprite.alpha - 0.07, 0);
      }
      wheel.sprite.alpha = Math.min(alpha, player.sprite.alpha);
    });
  };

  let updatePhantomVisbilityAccordingToUserSetting = function (player) {
    player.sprite.visible = !Client.phaser.race.hidePhantoms;
    player.nicknameText.visible = !Client.phaser.race.hidePhantoms;
    player.thrust.sprite.visible = !Client.phaser.race.hidePhantoms;
    player.thrust.particlesEmitter.visible = !Client.phaser.race.hidePhantoms;
    player.wheels.forEach((wheel) => {
      wheel.sprite.visible = !Client.phaser.race.hidePhantoms;
    });
    Client.phaser.globalDrawers.phantomsDriftMarks.visible =
      !Client.phaser.race.hidePhantoms;
  };

  Client.phaser.race.deletePlayer = function (
    player,
    fadeOutDuration = 0,
    destroySprites = false
  ) {
    if (!player.sprite) {
      return;
    }
    player.sprite.isInDeletingAnimation = true;

    // Make each part of the player fadeout : spaceship, nickname, thrust, wheels
    Client.phaser.fadeOut(player.sprite, fadeOutDuration, () => {
      if (!player.sprite) {
        return;
      }
      if (destroySprites) {
        player.sprite.destroy();
        player.sprite = undefined;
      } else {
        player.sprite.visible = false;
      }
    });

    Client.phaser.fadeOut(player.nicknameText, fadeOutDuration, () => {
      if (!player.nicknameText) {
        return;
      }
      if (destroySprites) {
        player.nicknameText.destroy();
        player.nicknameText = undefined;
      } else {
        player.nicknameText.visible = false;
      }
    });

    Client.phaser.fadeOut(player.thrust.sprite, fadeOutDuration, () => {
      if (!player.thrust.sprite) {
        return;
      }
      if (destroySprites) {
        player.thrust.sprite.destroy();
        player.thrust.particlesManager.destroy();
        player.thrust.sprite = undefined;
        player.thrust.cropRect = undefined;
        player.thrust.particlesEmitter = undefined;
      } else {
        player.thrust.sprite.visible = false;
        player.thrust.particlesEmitter.on = false;
      }
    });

    player.wheels.forEach((wheel) => {
      Client.phaser.fadeOut(wheel.sprite, fadeOutDuration, () => {
        if (destroySprites) {
          wheel.sprite.destroy();
          wheel.sprite = undefined;
        } else {
          wheel.sprite.visible = false;
        }
      });
    });
  };
};
