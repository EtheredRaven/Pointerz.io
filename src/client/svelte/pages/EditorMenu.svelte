<script>
  // Main menu with the circuit list when logged in
  import { fly, fade, slide } from "svelte/transition";
  import {
    Client,
    loadedEditorCircuits,
    loadedCircuits,
    loadedVoteCircuits,
    passedData,
    infoError,
    infoInfo,
  } from "../misc/store";
  import PointerzConfirm from "../components/ui/PointerzConfirm.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import AppLayout from "./AppLayout.svelte";
  import Cell from "../components/ui/Cell.svelte";
  import SelectionGrid from "../components/ui/SelectionGrid.svelte";
  import ParametersButtons from "../components/ui/ParametersButtons.svelte";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";

  const defaultNewCircuitName = "New circuit";
  let selectedCircuitId;
  $: selectedCircuit = $loadedEditorCircuits.find(
    (circuit) => circuit._id == selectedCircuitId
  );

  let formattedCircuits;
  $: formattedCircuits = $loadedEditorCircuits.map((circuit) => ({
    ...circuit,
    name: circuit.name,
    stats: formatCircuitStats(circuit),
    voteCircuitsDependency: !$loadedVoteCircuits, // Simple way to add reactivity to the loadedVoteCircuits dependency
  }));

  Client.socket.getVoteCircuits();

  function formatCircuitStats(circuit) {
    const isInVote = $loadedVoteCircuits.some((c) => c._id === circuit._id);
    const isInCampaign = $loadedCircuits.some((c) => c._id === circuit._id);

    return {
      date: {
        icon: "assets/images/menu/calendar.png",
        text: new Date(circuit.creationDate).toLocaleDateString(),
      },
      state: {
        icon: "assets/images/editorCircuitActions/saved.png",
        text: isInCampaign
          ? "In campaing"
          : isInVote
            ? "In vote"
            : circuit.runs.length > 0
              ? "Validated"
              : null,
      },
    };
  }

  function selectCircuit(id) {
    Client.phaser.playSound("buttonSelection");
    selectedCircuitId = id;
  }

  function createNewCircuit() {
    let newCircuitName = defaultNewCircuitName;
    let circuitNewId = 0;
    while (
      $loadedEditorCircuits.find((circuit) => circuit.name == newCircuitName)
    ) {
      circuitNewId++;
      newCircuitName = defaultNewCircuitName + " (" + circuitNewId + ")";
    }

    Client.socket.createNewEditorCircuit(newCircuitName);
  }

  function deleteEditorCircuit() {
    let selectedCircuit = $loadedEditorCircuits.find(
      (circuit) => circuit._id == selectedCircuitId
    );
    if (!selectedCircuit) {
      return;
    }

    Client.socket.deleteEditorCircuit(selectedCircuitId);
  }

  function editSelectedEditorCircuit() {
    if (!selectCircuit) {
      $infoError = "You did not select a circuit";
      return;
    }
    Client.pushRoute("/editor");
    Client.editor.initialize(selectedCircuit);
  }

  Client.svelte.updateEditorCircuitCreated = function ({
    retError,
    retInfo,
    newEditorCircuit,
  }) {
    if (retError) {
      $infoError = retError;
    } else {
      $infoInfo = retInfo;
      Client.svelte.updateLoadedEditorCircuits([
        newEditorCircuit,
        ...$loadedEditorCircuits,
      ]);
      selectCircuit(newEditorCircuit._id);
    }
  };

  Client.svelte.updateEditorCircuitDeleted = function ({
    retError,
    retInfo,
    deletedEditorCircuitId,
  }) {
    if (retError) {
      $infoError = retError;
    } else {
      $infoInfo = retInfo;
      let tempLoadedEditorCircuits = [...$loadedEditorCircuits];
      tempLoadedEditorCircuits.splice(
        tempLoadedEditorCircuits.findIndex(
          (circuit) => circuit._id == deletedEditorCircuitId
        ),
        1
      );
      Client.svelte.updateLoadedEditorCircuits(tempLoadedEditorCircuits);
    }
  };

  Client.svelte.updateLoadedEditorCircuits = function (editorCircuits) {
    if (!editorCircuits) {
      return;
    }

    $loadedEditorCircuits = editorCircuits.sort(
      (a, b) => b.creationDate - a.creationDate
    );
  };

  Client.svelte.updateLoadedEditorCircuits($passedData.editorCircuits);
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
          items={formattedCircuits}
          bind:selectedId={selectedCircuitId}
          title="Your Circuits"
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
                imagePath="assets/images/menu/edit.png"
                on:click={editSelectedEditorCircuit}>
                Edit
              </PointerzButton>

              <PointerzConfirm
                let:confirm={confirmThis}
                confirmTitle="Delete"
                cancelTitle="Cancel">
                <PointerzButton
                  buttonColor="darkRed"
                  important
                  noMargins
                  imagePath="assets/images/menu/delete.png"
                  noSound
                  on:click={() => confirmThis(deleteEditorCircuit)}>
                  Delete
                </PointerzButton>
                <span slot="title"
                  >Do you really want to delete this circuit?</span>
                <span slot="description" />
              </PointerzConfirm>
            </div>
          {/if}
          <div class="actions-container">
            <PointerzButton
              buttonColor="darkGreen"
              important
              noMargins
              imagePath="assets/images/menu/add.png"
              on:click={createNewCircuit}>
              Create New
            </PointerzButton>
          </div>
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
    margin-bottom: 8px;
  }

  @media (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
