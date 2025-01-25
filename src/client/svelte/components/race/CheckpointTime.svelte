<script>
  // Showing the checkpoint time when crossed
  import { fade } from "svelte/transition";
  import RankingAndTime from "../ui/RankingAndTime.svelte";
  import { Client } from "../../misc/store";

  let checkpointTime, checkpointPosition, checkpointDifference; // The data displayed
  let showCheckpointTime = false;
  let timeoutSet = false; // The current timeout (if checkpoint is showed)

  // This function is triggered each time tick
  Client.svelte.updateCheckpointTime = function (
    newCheckpointTime,
    position,
    difference
  ) {
    if (checkpointTime != newCheckpointTime) {
      // If that's a new checkpoint crossed
      checkpointTime = newCheckpointTime;
      checkpointPosition = position;
      checkpointDifference = difference;
      showCheckpointTime = true;
      Client.phaser.playSound("checkpoint");
      if (timeoutSet) {
        // Reset the timeout if new checkpoint crossed
        clearTimeout(timeoutSet);
      }
      timeoutSet = setTimeout(() => {
        timeoutSet = false;
        showCheckpointTime = false;
      }, 1500);

      // If that's the end
      if (Client.race.user.ended) {
        setTimeout(() => {
          // Show the end menu
          Client.phaser.playSound("raceEnded");
          Client.svelte.showEndraceMenu(
            true,
            checkpointPosition,
            checkpointTime,
            checkpointDifference
          );
        }, 500);
      }
    }
  };
</script>

{#if showCheckpointTime}
  <div class="checkpointTimeContainer" out:fade={{ duration: 400 }}>
    <div out:fade={{ duration: 200 }}>
      <RankingAndTime
        bind:checkpointTime
        bind:checkpointDifference
        bind:checkpointPosition />
    </div>
  </div>
{/if}

<style>
  .checkpointTimeContainer {
    position: absolute;
    top: 16px;
    text-align: center;
    width: 100%;
  }
</style>
