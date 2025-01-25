<script>
  // The current race time at each rendering step
  import { Client } from "../../misc/store";
  import { fade } from "svelte/transition";
  let currentInstant; // The time to be displayed

  Client.svelte.updateRaceTime = function () {
    currentInstant = Client.race.Functions.msToTime(
      Client.race.user.ended
        ? Client.race.user.checkpointsCrossed[
            Client.race.user.checkpointsCrossed.length - 1
          ].instant
        : Client.race.user.currentInstant
    );
  };
</script>

<div class="currentInstant" out:fade={{ duration: 400 }}>
  {currentInstant}
</div>

<style>
  .currentInstant {
    width: 100%;
    text-align: center;
    color: var(--almost-white-color);
    font-family: "Nunito";
    font-size: 46px;
    position: absolute;
    bottom: 16px;
  }
</style>
