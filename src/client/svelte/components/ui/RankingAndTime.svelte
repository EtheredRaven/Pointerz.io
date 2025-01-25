<script>
  import { Client } from "../../misc/store";
  import { css } from "../../misc/css";
  export let checkpointDifference = undefined;
  export let checkpointPosition = undefined;
  export let checkpointTime = undefined;
  export let fullSize = false;
  let fSizeClass = fullSize ? "fullSize" : "";

  $: noPosition = isNaN(checkpointPosition);
  $: noDifference = isNaN(checkpointDifference);
  $: cpDiff = Client.race.Functions.msToTime(
    checkpointDifference,
    3,
    false,
    true
  );
  $: cpTime = Client.race.Functions.msToTime(checkpointTime, 3);
</script>

<div
  class="timeContainer {fSizeClass}"
  style={"margin-bottom: " +
    css.default.margin +
    "px;" +
    (fullSize && noDifference ? "grid-template-rows: [l1] 36px [l2];" : "")}>
  <div
    class="checkpointPosition"
    style={noPosition ? "width: 0px;font-size: 0;padding:0;" : ""}>
    {checkpointPosition}<sup>{Client.getSupFromNumber(checkpointPosition)}</sup>
  </div>
  <div class="timeAndDifferenceContainer">
    <span
      class="checkpointTime"
      style="{noDifference ? 'border-bottom-right-radius:8px;' : ''} {noPosition
        ? 'border-top-left-radius:8px;'
        : ''} {noPosition && noDifference
        ? 'border-bottom-left-radius:8px'
        : ''}">
      {cpTime}
    </span>
    {#if !noDifference}
      <span
        class="difference {checkpointDifference > 0
          ? 'positiveDiff'
          : checkpointDifference < 0
            ? 'negativeDiff'
            : 'zeroDiff'}">
        {cpDiff}
      </span>
    {/if}
  </div>
</div>

<style>
  .timeAndDifferenceContainer {
    display: inline-block;
  }

  .timeContainer {
    color: var(--almost-white-color);
    border-radius: 8px;
    display: inline-block;
    font-family: "Nunito";
    font-size: 18px;
  }

  .fullSize {
    display: grid;
    width: 100%;
    grid-template-rows: [l1] 36px [l2] 36px [l3];
    grid-template-columns: [c1] auto [c2] 1fr [c3];
  }

  .checkpointPosition {
    background: var(--dark-grey-color);
    font-family: virgo;
    font-size: 24px;
    box-sizing: border-box;
    height: 36px;
    padding: 4px 12px;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    float: left;
  }

  .checkpointTime {
    display: block;
    height: 36px;
    padding-top: 8px;
    box-sizing: border-box;
    padding-right: 8px;
    padding-left: 8px;
    padding: 7px 12px;
    background: var(--dark-grey-shadow-color);
    border-top-right-radius: 8px;
  }

  .difference {
    display: block;
    height: 36px;
    box-sizing: border-box;
    padding: 7px 12px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .positiveDiff {
    background: var(--red-color);
  }

  .negativeDiff {
    background: var(--green-color);
  }

  .zeroDiff {
    background: var(--grey-color);
  }

  sup {
    font-size: 40%;
  }
</style>
