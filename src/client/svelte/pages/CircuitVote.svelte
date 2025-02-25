<script>
  // Main menu with the circuit list when logged in
  import { fly, fade, slide } from "svelte/transition";
  import { Client, loadedVoteCircuits, infoError } from "../misc/store";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import AppLayout from "./AppLayout.svelte";
  import Cell from "../components/ui/Cell.svelte";
  import SelectionGrid from "../components/ui/SelectionGrid.svelte";
  import ParametersButtons from "../components/ui/ParametersButtons.svelte";

  let selectedCircuitId;
  $: selectedCircuit = $loadedVoteCircuits.find(
    (circuit) => circuit._id == selectedCircuitId
  );

  function formatCircuitStats(circuit) {
    return {
      votes: {
        icon: "assets/images/circuitVote/upvote.png",
        text: `${circuit.upvotes} votes`,
      },
      date: {
        icon: "assets/images/menu/calendar.png",
        text: new Date(circuit.creationDate).toLocaleDateString(),
      },
    };
  }

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

  Client.svelte.handleUpvoteResult = function (data) {
    if (data.retError) {
      $infoError = data.retError;
    } else {
      selectedCircuit.upvotes = data.newCircuitModel.upvotes;
      selectedCircuit = selectedCircuit;
      selectedCircuit.isUpvotedByUser = data.isUpvoted;
    }
  };

  Client.socket.getVoteCircuits();
</script>

<AppLayout>
  <OfflineRedirect />
  <div
    class="container"
    in:fly={{ delay: 400, duration: 400 }}
    out:fade={{ duration: 400 }}>
    <ParametersButtons backHref="/privatemenu" />

    <div class="content-grid">
      <div class="circuits-column">
        <SelectionGrid
          items={$loadedVoteCircuits.map((circuit) => ({
            ...circuit,
            stats: formatCircuitStats(circuit),
          }))}
          bind:selectedId={selectedCircuitId}
          title="Circuits for Vote"
          titleColor="darkOrange"
          titleIcon="assets/images/menu/circuit.png"
          getItemId={(item) => item._id}
          on:select={({ detail }) => selectCircuit(detail.id)} />
      </div>

      <div class="details-column">
        <Cell
          title="Circuit Actions"
          color="darkBlue"
          titleImagePath="assets/images/menu/gear.png">
          {#if selectedCircuitId}
            <div class="actions-container" transition:slide>
              <PointerzButton
                buttonColor="darkBlue"
                important
                noMargins
                imagePath="assets/images/circuitVote/raceTest.png"
                on:click={trySelectedCircuit}>
                Try Circuit
              </PointerzButton>
              {#if selectedCircuit.isUpvotedByUser}
                <PointerzButton
                  buttonColor="darkRed"
                  important
                  noMargins
                  imagePath="assets/images/circuitVote/downvote.png"
                  on:click={upvoteSelectedCircuit}>
                  Remove Vote
                </PointerzButton>
              {:else}
                <PointerzButton
                  buttonColor="darkGreen"
                  important
                  noMargins
                  imagePath="assets/images/circuitVote/upvote.png"
                  on:click={upvoteSelectedCircuit}>
                  Vote for Circuit
                </PointerzButton>
              {/if}
            </div>
          {:else}
            <div class="no-selection">Select a circuit to view actions</div>
          {/if}
        </Cell>
      </div>
    </div>
  </div>
</AppLayout>

<style>
  .container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    margin-top: 2rem;
  }

  .actions-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: var(--container-blocks-bg);
    border-radius: 8px;
  }

  .no-selection {
    text-align: center;
    padding: 12px;
    background: var(--over-container-blocks-bg);
    border-radius: 8px;
    color: var(--almost-white-color);
    font-family: "Nunito";
    font-size: 16px;
  }

  @media (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
