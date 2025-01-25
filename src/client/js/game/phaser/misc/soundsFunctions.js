module.exports = function (Client) {
  const SOUNDTRACK_VOLUME = 0.3;
  const SOUND_EFFECT_VOLUME = 0.45;

  const FADE_DURATION_SHORT = 100; // ms
  const FADE_DURATION_LONG = 500; // ms
  const FADE_STEPS = 20; // Add this at top with other constants

  // Stop the soundtrack
  Client.phaser.stopSoundtrack = function () {
    if (Client.soundtrack) {
      Client.soundtrack.stop();
      Client.soundtrack.destroy();
    }
  };

  // Play the main soundtrack
  Client.phaser.playMainSoundtrack = function () {
    if (!Client.phaser.scene) return;
    // If the soundtrack is already playing, don't play it again
    if (Client.soundtrack && Client.soundtrack.key == "mainsoundtrack") return;
    Client.phaser.stopSoundtrack();
    Client.soundtrack = Client.phaser.scene.sound.add("mainsoundtrack", {
      volume: SOUNDTRACK_VOLUME,
    });

    Client.soundtrack.play();
    Client.soundtrack.loop = true;
  };

  // Play a random soundtrack
  Client.phaser.playRandomSoundtrack = function () {
    if (!Client.phaser.scene) return;
    Client.phaser.stopSoundtrack();
    let random = Math.floor(Math.random() * Client.NUMBER_OF_SOUNDTRACKS) + 1;
    Client.soundtrack = Client.phaser.scene.sound.add("soundtrack" + random, {
      volume: SOUNDTRACK_VOLUME,
    });
    // Play at a lower volume
    Client.soundtrack.play();
    Client.soundtrack.loop = false;

    // When the soundtrack ends, play another one after a delay
    Client.soundtrack.on("complete", function () {
      setTimeout(Client.phaser.playRandomSoundtrack, 1000);
    });
  };

  Client.phaser.playSound = function (sound, volume = 1) {
    if (!Client.phaser.scene) return;
    let soundEffect = Client.phaser.scene.sound.add(sound, {
      volume: SOUND_EFFECT_VOLUME * volume,
    });
    soundEffect.loop = false;
    soundEffect.play();
  };

  function smoothPropertyTransition(
    sound,
    property, // 'volume' or 'rate'
    targetValue,
    duration = FADE_DURATION_SHORT,
    onComplete = null,
    initialValue = null
  ) {
    if (!sound) return;

    // Create unique interval reference for each property
    const intervalKey = `_${property}Interval`;
    const setterMethod = `set${
      property.charAt(0).toUpperCase() + property.slice(1)
    }`;

    // Use provided initial value or current value
    const startValue = initialValue !== null ? initialValue : sound[property];
    const valueDiff =
      (Math.sign(targetValue - startValue) *
        Math.floor(100 * Math.abs(targetValue - startValue))) /
      100;
    const stepDuration = duration / FADE_STEPS;
    let currentStep = 0;

    // Clear existing interval for this property
    if (sound[intervalKey]) {
      clearInterval(sound[intervalKey]);
      sound[intervalKey] = null;
    }

    if (valueDiff === 0) {
      sound[setterMethod](targetValue);
      if (onComplete) onComplete();
      return;
    }

    let intervalFunction = () => {
      // Check if sound still exists and is valid
      if (!sound || sound.destroyed) {
        clearInterval(sound[intervalKey]);
        sound[intervalKey] = null;
        return;
      }

      currentStep++;
      const progress = currentStep / FADE_STEPS;
      const newValue = Math.max(0, startValue + valueDiff * progress);

      sound[setterMethod](newValue);

      if (currentStep >= FADE_STEPS || newValue === targetValue) {
        clearInterval(sound[intervalKey]);
        sound[intervalKey] = null;
        if (onComplete) onComplete();
      }
    };

    sound[intervalKey] = setInterval(intervalFunction, stepDuration);
    intervalFunction();
  }

  function smoothVolumeTransition(
    sound,
    targetVolume,
    fadeDuration = FADE_DURATION_SHORT,
    onComplete = null,
    initialVolume = null
  ) {
    smoothPropertyTransition(
      sound,
      "volume",
      targetVolume,
      fadeDuration,
      onComplete,
      initialVolume
    );
  }

  function smoothRateTransition(
    sound,
    targetRate,
    fadeDuration = FADE_DURATION_SHORT,
    onComplete = null,
    initialRate = null
  ) {
    smoothPropertyTransition(
      sound,
      "rate",
      targetRate,
      fadeDuration,
      onComplete,
      initialRate
    );
  }

  // Play the engine sound
  // The pitch of the engine sound is proportional to the speed of the spaceship
  Client.phaser.playEngineSound = function (speed, maxSpeed) {
    if (!Client.phaser.scene) return;

    const MIN_RATE = 0.3;
    const MAX_RATE = 4;

    if (!Client.engineSound) {
      Client.engineSound = Client.phaser.scene.sound.add("engine", {
        volume: 0,
        loop: true,
      });
      Client.engineSound.play();
    }

    if (Client.engineSound) {
      if (Client.engineSound.volume <= 0 || Client.engineSound.isStopping) {
        Client.engineSound.isStopping = false;
        smoothVolumeTransition(
          Client.engineSound,
          SOUND_EFFECT_VOLUME,
          FADE_DURATION_SHORT,
          null,
          0
        );
      }

      if (Client.engineSound.volume > 0) {
        // Normalize speed to 0-1 range
        const normalizedSpeed = Math.max(0, Math.min(1, speed / maxSpeed));

        // Use exponential curve with adjustable power for better control
        // power < 1 makes curve steeper at start and flatter at end
        // power > 1 makes curve flatter at start and steeper at end
        const power = 1.5; // Adjust this value to fine-tune the curve
        const curveValue = Math.pow(normalizedSpeed, power);

        // Ease out the very high and very low ends
        // Map to rate range
        const rate = MIN_RATE + curveValue * (MAX_RATE - MIN_RATE);

        // Update rate dynamically
        smoothRateTransition(Client.engineSound, rate, FADE_DURATION_SHORT);
      }
    }
  };

  // Stop the engine sound
  Client.phaser.stopEngineSound = function () {
    if (
      Client.engineSound &&
      Client.engineSound.volume > 0 &&
      !Client.engineSound.isStopping
    ) {
      Client.engineSound.isStopping = true;
      smoothVolumeTransition(Client.engineSound, 0, FADE_DURATION_SHORT, () => {
        Client.engineSound.isStopping = false;
      });
    }
  };

  Client.phaser.playSpaceshipThrustSound = function (
    highPitchSpaceshipThrustVolume
  ) {
    if (!Client.phaser.scene) return;
    if (!Client.thrustSound) {
      Client.thrustSound = Client.phaser.scene.sound.add("spaceshipThrust", {
        volume: 0,
        loop: true,
      });
      Client.thrustSound.play();
    }

    if (
      Client.thrustSound &&
      (Client.thrustSound.volume <= 0 || Client.thrustSound.isStopping)
    ) {
      Client.thrustSound.isStopping = false;
      smoothVolumeTransition(
        Client.thrustSound,
        SOUND_EFFECT_VOLUME,
        FADE_DURATION_LONG,
        null,
        0
      );
    }

    // Set the volume of the high pitch sound
    if (highPitchSpaceshipThrustVolume != undefined) {
      if (!Client.highPitchSpaceshipThrustSound) {
        Client.highPitchSpaceshipThrustSound = Client.phaser.scene.sound.add(
          "highPitchSpaceshipThrust",
          {
            volume: 0,
            loop: true,
          }
        );
        Client.highPitchSpaceshipThrustSound.play();
      } else {
        // Update volume dynamically
        smoothVolumeTransition(
          Client.highPitchSpaceshipThrustSound,
          highPitchSpaceshipThrustVolume * SOUND_EFFECT_VOLUME,
          FADE_DURATION_SHORT
        );
      }
    }
  };

  Client.phaser.stopSpaceshipThrustSound = function () {
    // Fade out main thrust
    if (
      Client.thrustSound &&
      Client.thrustSound.volume > 0 &&
      !Client.thrustSound.isStopping
    ) {
      Client.thrustSound.isStopping = true;
      smoothVolumeTransition(Client.thrustSound, 0, FADE_DURATION_LONG, () => {
        Client.thrustSound.isStopping = false;
      });
    }

    // Fade out high pitch
    if (
      Client.highPitchSpaceshipThrustSound &&
      Client.highPitchSpaceshipThrustSound.volume > 0
    ) {
      smoothVolumeTransition(
        Client.highPitchSpaceshipThrustSound,
        0,
        FADE_DURATION_SHORT
      );
    }
  };

  Client.phaser.pauseEngineSounds = function () {
    Client.engineSound && Client.engineSound.pause();
    Client.thrustSound && Client.thrustSound.pause();
    Client.highPitchSpaceshipThrustSound &&
      Client.highPitchSpaceshipThrustSound.pause();
  };

  Client.phaser.resumeEngineSounds = function () {
    Client.engineSound && Client.engineSound.resume();
    Client.thrustSound && Client.thrustSound.resume();
    Client.highPitchSpaceshipThrustSound &&
      Client.highPitchSpaceshipThrustSound.resume();
  };

  Client.phaser.playDriftSound = function () {
    if (!Client.phaser.scene) return;
    if (!Client.driftSound) {
      Client.driftSound = Client.phaser.scene.sound.add("drift", {
        volume: SOUND_EFFECT_VOLUME,
        loop: false,
      });
      Client.driftSound.play();
    }
  };

  Client.phaser.stopDriftSound = function () {
    if (Client.driftSound) {
      Client.driftSound.stop();
      Client.driftSound.destroy();
      Client.driftSound = null;
    }
  };
};
