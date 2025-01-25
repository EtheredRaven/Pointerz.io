<script>
  // The end-race menu (that can also be displayed by pressing on escape)
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import { Shadow } from "svelte-loading-spinners";

  import { Client, loggedIn } from "../../misc/store";
  import { css } from "../../misc/css";

  import PointerzButton from "../ui/PointerzButton.svelte";
  import RankingAndTime from "../ui/RankingAndTime.svelte";
  import Cell from "../ui/Cell.svelte";
  import CellTitle from "../ui/CellTitle.svelte";
  import FlexContainer from "../ui/FlexContainer.svelte";

  let showMenu = false;
  let raceRanking, raceTime, timeDiffWithGlobal; // The race times and rankings
  let globalRanking, globalTime; // The global times and rankings for the logged user
  let globalRecordLoading = false; // The loading animation when a record is being recorded on the database
  let circuitName = "";
  let isResume = true; // Show the resume button only if the race has not ended
  let resumeButtonWidth = 50; // In percent
  let isEditedCircuit = false;
  let isVoteCircuit = false;

  // Actions of the menu
  function goToMenu() {
    showMenu = false;
    isVoteCircuit
      ? Client.pushRoute("/circuitvote")
      : Client.pushRoute("/campaignmenu");
    Client.race.stop();
    !isVoteCircuit && Client.socket.getCircuitRecords();
  }

  function goToEditor() {
    showMenu = false;
    Client.pushRoute("/editor");
    let circuitToEdit = Client.race.game.currentCircuit;
    Client.race.stop();
    Client.editor.initialize(circuitToEdit);
  }

  function restart() {
    showMenu = false;
    Client.race.restart();
  }

  function resume() {
    Client.race.setRacePause(false);
    Client.svelte.showEndraceMenu(false);
  }

  // Show the menu (triggered if the race has ended or if the escape is pressed)
  Client.svelte.showEndraceMenu = function (show, pos, time, diff) {
    if (show == showMenu) {
      // do it only if that's not the current state
      return;
    }

    isEditedCircuit = Client.race.game.currentCircuit.isEditedCircuit;
    isVoteCircuit = Client.race.game.currentCircuit.campaignPublicationTime < 0;

    // Update the data and buttons
    resumeButtonWidth = Client.race.user.ended ? 100 : 50;
    isResume = !Client.race.user.ended;
    circuitName = Client.race.game.currentCircuit.name;

    showMenu = show;
    raceRanking = pos;
    raceTime = time;
    timeDiffWithGlobal = diff;

    if ((isNaN(diff) || diff < 0) && time) {
      // If that's a new record, then do the loading animation to wait for the new record to be validated by the server
      globalRecordLoading = true;
    }
  };

  // Once the new record has arrived
  Client.svelte.updateEndraceRecord = function () {
    if (!Client.race.user.record || !Client.race.user.record.run) {
      return;
    } // Error handling
    globalRecordLoading = false;
    globalRanking = Client.race.user.record.ranking + 1;
    globalTime = Client.race.user.record.run.runTime;
  };
</script>

{#if showMenu}
  <div class="overlay" in:fade={{ duration: 800 }} out:fade={{ duration: 400 }}>
    <Cell
      color="orange"
      style="
            width:{css.endRace.blockWidth + 2 * css.default.margin}px;
            position:absolute;
            top: calc(50% - 200px);
            margin-left: auto;
            margin-right: auto;
            left: 0;
            right: 0;
            text-align: center;"
      title={circuitName}
      titleImagePath="assets/images/menu/circuit.png">
      {#if raceTime}
        <CellTitle
          small
          noMargins
          color="darkOrange"
          imagePath="assets/images/menu/trophy.png">
          Race
        </CellTitle>
        <RankingAndTime
          bind:checkpointPosition={raceRanking}
          bind:checkpointTime={raceTime}
          fullSize />
      {/if}
      {#if !isVoteCircuit}
        <CellTitle
          small
          noMargins
          color="darkOrange"
          imagePath="assets/images/menu/{$loggedIn ? 'globe' : 'user'}.png">
          {$loggedIn ? "World ranking" : "Best time"}
        </CellTitle>
        {#if globalRecordLoading}
          <div class="centerer">
            <Shadow size="16" color="var(--almost-white-color)" unit="px" />
          </div>
        {:else if globalTime}
          <RankingAndTime
            bind:checkpointDifference={timeDiffWithGlobal}
            bind:checkpointPosition={globalRanking}
            bind:checkpointTime={globalTime}
            fullSize />
        {:else}
          <div class="noRecord" style="margin-bottom:8px;">
            No record on this circuit
          </div>
        {/if}
      {/if}
      <FlexContainer flexWrap="wrap" justifyContent="center">
        {#if isResume}
          <PointerzButton
            buttonColor="green"
            on:click={resume}
            important
            elementsPerRow="2">
            Resume
          </PointerzButton>
        {/if}
        <PointerzButton
          buttonColor="red"
          on:click={restart}
          important
          elementsPerRow={isResume ? 2 : 1}
          lastElementOfRow="true">
          Restart
        </PointerzButton>
      </FlexContainer>
      <FlexContainer flexWrap="wrap" justifyContent="center">
        {#if isEditedCircuit}
          <PointerzButton buttonColor="blue" on:click={goToEditor} important>
            Go to editor
          </PointerzButton>
        {:else}
          <PointerzButton buttonColor="blue" on:click={goToMenu} important>
            Change circuit
          </PointerzButton>
        {/if}
      </FlexContainer>
    </Cell>
  </div>
{/if}

<style>
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    background-color: var(--overlay-bg);
    color: var(--almost-white-color);
  }

  .centerer {
    margin-top: 10px;
    margin-bottom: 6px;
    display: inline-block;
  }

  .noRecord {
    display: block;
    height: 36px;
    box-sizing: border-box;
    padding: 7px 12px;
    background: var(--dark-grey-color);
    border-radius: 8px;
    width: 100%;
  }
</style>
