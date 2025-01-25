<script>
  // The lap times interface
  import { Client } from "../../misc/store";
  import { fade } from "svelte/transition";
  import PointerzTable from "../ui/PointerzTable.svelte";
  let lapsColumns = [
    {
      name: "ranking",
      style: "font-size: 20px;width: fit-content;font-family:virgo",
    },

    {
      name: "lapTime",
      style:
        "text-align: right;font-style: italic;font-size: 14px;width: 74px;vertical-align:middle;",
    },
  ];
  let lapsNumber, currentLap, lapsValues, totalTimePreviousLaps;

  // Default values for the variables used in this component
  Client.svelte.initLapsNumber = function (number) {
    lapsValues = []; // The times for the different laps
    lapsNumber = number; // The expected total number of laps at the end of the race
    currentLap = 0; // The current lap
    totalTimePreviousLaps = 0; // The total time of all the previous laps (for computing the current lap time)
    Client.svelte.addNewLap();
  };

  // Add a new lap to the race
  Client.svelte.addNewLap = function (previousLapTime) {
    if (lapsValues.length > 0) {
      // New lap = changing the state of the previous lap (if it exists )
      let lastLap = lapsValues[lapsValues.length - 1];
      lastLap.highlighted = false; // not highlighting it
      lastLap.lapTime = Client.race.Functions.msToTime(
        previousLapTime - totalTimePreviousLaps,
        3
      ); // Updating the lap time
      totalTimePreviousLaps = previousLapTime; // Updating the total laps value
    }
    currentLap++;
    lapsValues = [
      ...lapsValues,
      {
        ranking: currentLap,
        lapTime: Client.race.Functions.msToTime(0, 3),
        highlighted: true,
      },
    ]; // Adding the current lap
  };

  // Update the lap timing
  Client.svelte.updateLapTimes = function (currentTime) {
    if (!lapsValues.length) {
      return;
    }
    lapsValues[lapsValues.length - 1].lapTime = Client.race.Functions.msToTime(
      currentTime - totalTimePreviousLaps,
      3
    );
    lapsValues = lapsValues;
  };
</script>

{#if lapsNumber > 1}
  <div class="lapCounter" out:fade={{ duration: 400 }}>
    <div class="lapCounterTitle">
      Laps
      <div class="smallCounterContainer">{currentLap} / {lapsNumber}</div>
    </div>
    <PointerzTable
      bind:values={lapsValues}
      columns={lapsColumns}
      highlightedStyle="background: rgba(100,100,100,0.5);color: white;"
    />
  </div>
{/if}

<style>
  .lapCounterTitle {
    font-family: "Nunito Bold";
    font-size: 18px;
    text-align: center;
    margin-bottom: 8px;
  }

  .lapCounter {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 180px;
    padding: 12px 12px;
    color: white;
    background: rgba(60, 60, 60, 0.5);
    box-sizing: border-box;
    border-radius: 8px;
  }

  .smallCounterContainer {
    background: rgba(100, 100, 100, 0.5);
    margin-left: 4px;
    padding: 4px 8px;
    display: inline-block;
    border-radius: 4px;
    font-size: 14px;
    font-family: "Nunito";
  }
</style>
