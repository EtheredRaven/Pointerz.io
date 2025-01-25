<script>
  // 3, 2, 1, GO !
  import { scale, fade } from "svelte/transition";
  import { Client } from "../../misc/store";
  let raceCounter; // The number to be displayed
  let showCounter = false;

  Client.svelte.startRaceCounter = function () {
    raceCounter = 4;
    showCounter = false;
    setTimeout(() => {
      let updateInterval = setInterval(() => {
        // -1 each second and making the new one appear and then disappear
        if (!Client.race.game) {
          clearInterval(updateInterval);
          return;
        }
        if (Client.race.game.racePaused) {
          return;
        }
        if (!showCounter) {
          raceCounter--;
          if (raceCounter == 0) {
            Client.phaser.playSound("raceStart");
          } else if (raceCounter > 0) {
            Client.phaser.playSound("raceCountdown");
          }
        }
        showCounter = !showCounter;
        if (raceCounter == 0) {
          Client.race.user.startRace();
        } else if (raceCounter < 0) {
          showCounter = false;
          clearInterval(updateInterval);
        }
      }, 500);
    }, 500);
  };
</script>

{#if showCounter}
  <div
    class="raceCounter"
    in:scale={{ duration: 500 }}
    out:fade={{ duration: 400 }}>
    {raceCounter ? raceCounter : "GO !"}
  </div>
{/if}

<style>
  .raceCounter {
    font-family: virgo;
    font-size: 150px;
    color: var(--almost-white-color);
    margin: 0;
    position: absolute;
    top: calc(50% - 75px);
    width: 100%;
    text-align: center;
  }
</style>
