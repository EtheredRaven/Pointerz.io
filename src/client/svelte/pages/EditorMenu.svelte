<script>
  // Main menu with the circuit list when logged in
  import { fly, fade, slide } from "svelte/transition";
  import { push } from "svelte-spa-router";
  import {
    Client,
    loadedEditorCircuits,
    passedData,
    infoError,
    infoInfo,
  } from "../misc/store";
  import PointerzConfirm from "../components/ui/PointerzConfirm.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import AppLayout from "./AppLayout.svelte";
  import Cell from "../components/ui/Cell.svelte";
  import TextBlock from "../components/ui/TextBlock.svelte";
  import BackButton from "../components/ui/BackButton.svelte";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";

  const defaultNewCircuitName = "New circuit";
  let selectedCircuitId;
  $: selectedCircuit = $loadedEditorCircuits.find(
    (circuit) => circuit._id == selectedCircuitId
  );

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
    in:fly={{ delay: 400, duration: 400 }}
    out:fade={{ duration: 400 }}
    id="menuContainer">
    <BackButton backHref="/privatemenu" />
    <div class="circuitsContainer">
      <Cell
        title="Circuits"
        color="orange"
        titleImagePath="assets/images/menu/circuit.png">
        {#each $loadedEditorCircuits as circuit, i (circuit._id)}
          <TextBlock
            clickable
            color={selectedCircuitId == circuit._id ? "darkOrange" : "grey"}
            on:click={() => selectCircuit(circuit._id)}
            slideTransition>
            {circuit.name}
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
              imagePath="assets/images/menu/edit.png"
              animateImage="false"
              imageHeight="16px"
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
                elementsPerRow="1"
                imagePath="assets/images/menu/delete.png"
                animateImage="false"
                imageHeight="16px"
                noSound
                on:click={() => confirmThis(deleteEditorCircuit)}>
                Delete
              </PointerzButton>
              <span slot="title">
                Do you really want to delete this circuit ?
              </span>
              <span slot="description" />
            </PointerzConfirm>
          </div>
        {/if}
        <PointerzButton
          buttonColor="darkGreen"
          important
          elementsPerRow="1"
          lastRow
          imagePath="assets/images/menu/add.png"
          animateImage="false"
          imageHeight="16px"
          on:click={createNewCircuit}>
          New
        </PointerzButton>
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
</style>
