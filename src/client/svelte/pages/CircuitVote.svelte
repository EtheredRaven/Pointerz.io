<script>
  // Main menu with the circuit list when logged in
  import { fly, fade, slide } from "svelte/transition";
  import { push } from "svelte-spa-router";
  import {
    Client,
    loadedVoteCircuits,
    passedData,
    infoError,
    infoInfo,
    userModel,
  } from "../misc/store";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import AppLayout from "./AppLayout.svelte";
  import Cell from "../components/ui/Cell.svelte";
  import TextBlock from "../components/ui/TextBlock.svelte";
  import BackButton from "../components/ui/BackButton.svelte";

  let selectedCircuitId;
  $: selectedCircuit = $loadedVoteCircuits.find(
    (circuit) => circuit._id == selectedCircuitId
  );

  function selectCircuit(id) {
    Client.phaser.playSound("buttonSelection");
    selectedCircuitId = id;
  }

  function trySelectedCircuit() {
    Client.pushRoute("/race");
    Client.socket.emitJoinNewRoom(selectedCircuitId, false, true);
  }

  function upvoteSelectedCircuit() {
    Client.socket.emitUpvoteCircuit(selectedCircuitId);
  }

  Client.svelte.updateLoadedVoteCircuits = function (voteCircuits) {
    if (!voteCircuits) {
      return;
    }

    $loadedVoteCircuits = voteCircuits.sort((a, b) => {
      let upvoteDiff = b.upvotes - a.upvotes;
      return upvoteDiff == 0 ? b.creationDate - a.creationDate : upvoteDiff;
    });
    $loadedVoteCircuits.forEach((voteCircuit) => {
      let userVotedForThisCircuit =
        $userModel.circuitVotes.findIndex(
          (vote) => vote.toString() == voteCircuit._id.toString()
        ) >= 0;
      voteCircuit.isUpvotedByUser = userVotedForThisCircuit;
    });
  };

  Client.svelte.handleUpvoteResult = function (data) {
    if (data.retError) {
      $infoError = data.retError;
    } else {
      selectedCircuit.upvotes = data.newCircuitModel.upvotes;
      selectedCircuit = selectedCircuit;
      selectedCircuit.isUpvotedByUser = data.isUpvoted;
    }
  };

  Client.svelte.updateLoadedVoteCircuits($passedData.voteCircuits);
</script>

<AppLayout>
  <OfflineRedirect />
  <div
    in:fly={{ delay: 400, duration: 400 }}
    out:fade={{ duration: 400 }}
    id="menuContainer">
    <BackButton backHref="/privatemenu" />
    <div class="circuitsContainer">
      <Cell
        title="Circuits for vote"
        color="orange"
        titleImagePath="assets/images/menu/circuit.png">
        {#each $loadedVoteCircuits as circuit, i (circuit._id)}
          <TextBlock
            clickable
            color={selectedCircuitId == circuit._id ? "darkOrange" : "grey"}
            on:click={() => selectCircuit(circuit._id)}
            slideTransition>
            {circuit.name}
            <span class="circuitVotes">
              {circuit.upvotes} 🡅
            </span>
          </TextBlock>
        {/each}
      </Cell>
    </div>
    <div class="actionsContainer">
      <Cell>
        {#if selectedCircuitId}
          <div transition:slide style="margin-bottom: 16px;">
            <PointerzButton
              buttonColor="darkBlue"
              important
              elementsPerRow="1"
              imagePath="assets/images/circuitVote/raceTest.png"
              animateImage="false"
              imageHeight="16px"
              on:click={trySelectedCircuit}>
              Try circuit
            </PointerzButton>
            {#if selectedCircuit.isUpvotedByUser}
              <PointerzButton
                buttonColor="darkRed"
                important
                elementsPerRow="1"
                imagePath="assets/images/circuitVote/downvote.png"
                animateImage="false"
                imageHeight="16px"
                on:click={upvoteSelectedCircuit}>
                Downvote
              </PointerzButton>
            {:else}
              <PointerzButton
                buttonColor="darkGreen"
                important
                elementsPerRow="1"
                imagePath="assets/images/circuitVote/upvote.png"
                animateImage="false"
                imageHeight="16px"
                on:click={upvoteSelectedCircuit}>
                Upvote
              </PointerzButton>
            {/if}
          </div>
        {/if}
      </Cell>
    </div>
  </div>
</AppLayout>

<style>
  #menuContainer {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-template-rows: auto;
    max-width: 600px;
    min-width: 230px;
    width: 70%;
    margin: auto;
  }

  .circuitsContainer {
    display: flex;
    flex-direction: column;
    grid-column-start: 1;
    grid-column-end: 2;
  }

  .actionsContainer {
    display: flex;
    flex-direction: column;
    grid-column-start: 2;
    grid-column-end: 3;
  }

  .circuitVotes {
    float: right;
    font-family: Nunito;
    font-size: 18px;
  }
</style>
