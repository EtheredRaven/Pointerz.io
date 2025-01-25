<script>
  import { Client, infoError, infoInfo } from "../../misc/store";
  import { push } from "svelte-spa-router";
  import PointerzConfirm from "../ui/PointerzConfirm.svelte";
  let imagesPath = "../../../assets/images/editorCircuitActions/";
  let circuitSaved = true;
  let circuitValidated = Client.editor.editedCircuit.runs.length > 0;

  let actionFunctions = {
    save: () => {
      if (!circuitSaved) {
        Client.socket.saveEditorCircuit(Client.editor.editedCircuit);
        circuitValidated = false;
      }
    },
    startValidationRace: () => {
      if (Client.editor.editedCircuit.isRaceReady()) {
        circuitSaved ? startRace() : saveAndStartRace();
      } else {
        $infoError =
          "The circuit must have one starting block and at least one ending block.";
      }
    },
    publish: () => {
      Client.socket.publishEditorCircuit(Client.editor.editedCircuit);
    },
  };

  let leaveEditor = () => {
    Client.socket.getEditorCircuits();
    Client.editor.delete();
    Client.pushRoute("/editormenu");
  };

  let saveAndLeaveEditor = () => {
    actionFunctions.save();
    let interval = setInterval(() => {
      if (circuitSaved) {
        clearInterval(interval);
        leaveEditor();
      }
    }, 100);
  };

  let startRace = () => {
    let circuitId = Client.editor.editedCircuit._id;
    Client.editor.delete();
    Client.pushRoute("/race");
    Client.socket.emitJoinNewRoom(circuitId, true);
  };

  let saveAndStartRace = () => {
    actionFunctions.save();
    let interval = setInterval(() => {
      if (circuitSaved) {
        clearInterval(interval);
        startRace();
      }
    }, 100);
  };

  Client.svelte.showEditorCircuitSavedState = function (dbSavedResult) {
    if (dbSavedResult.retError) {
      $infoError = dbSavedResult.retError;
    } else if (dbSavedResult.retInfo) {
      Client.phaser.editor.setCircuitSavedState(true);
      $infoInfo = dbSavedResult.retInfo;
    }
  };

  Client.svelte.showEditorCircuitPublishedState = function (dbSavedResult) {
    dbSavedResult.retError
      ? ($infoError = dbSavedResult.retError)
      : ($infoInfo = dbSavedResult.retInfo);
  };

  Client.svelte.updateCircuitSavedState = function () {
    circuitSaved = Client.phaser.editor.saved;
  };

  Client.svelte.updateCircuitValidatedState = function (newState) {
    circuitValidated = newState;
  };
</script>

<div class="actionsMenuContainer">
  <PointerzConfirm
    color="green"
    confirmTitle="Save and leave"
    cancelTitle="Leave without saving"
    let:confirm={confirmThis}
    cancelFunction={() => {
      Client.phaser.playSound("cancelClick");
      leaveEditor();
    }}
    showConfirm={!circuitSaved}>
    <div
      class="actionContainer"
      on:click={() => confirmThis(saveAndLeaveEditor)}>
      <img
        class="actionImage"
        alt="actionImage"
        src={imagesPath + "back.png"} />
    </div>
    <span slot="title">
      Do you really want to leave the editor without saving changes ?
    </span>
  </PointerzConfirm>
  <div class="actionContainer" on:click={actionFunctions.save}>
    <img class="actionImage" alt="actionImage" src={imagesPath + "save.png"} />
    <div class="actionImageStateContainer">
      <img
        class="actionImageState"
        alt="actionImageState"
        src={imagesPath + (circuitSaved ? "saved.png" : "unsaved.png")} />
    </div>
  </div>
  <div class="actionContainer" on:click={actionFunctions.startValidationRace}>
    <img
      class="actionImage"
      alt="actionImage"
      src={imagesPath + "raceTest.png"} />
    <div class="actionImageStateContainer">
      <img
        class="actionImageState"
        alt="actionImageState"
        src={imagesPath + (circuitValidated ? "saved.png" : "unsaved.png")} />
    </div>
  </div>
  <PointerzConfirm
    color="red"
    confirmTitle={circuitSaved && circuitValidated
      ? "Publish"
      : "Save and validate"}
    cancelTitle="Cancel"
    let:confirm={confirmThis}>
    <div
      class="actionContainer"
      on:click={() =>
        confirmThis(
          circuitSaved && circuitValidated
            ? actionFunctions.publish
            : actionFunctions.raceTest
        )}>
      <img
        class="actionImage"
        alt="actionImage"
        src={imagesPath + "share.png"} />
    </div>
    <span slot="title">
      {circuitSaved && circuitValidated
        ? "Publishing circuit"
        : "Error publishing circuit"}
    </span>
    <span slot="description">
      {circuitSaved && circuitValidated
        ? "Do you really want to publish your circuit in the weekly list ?"
        : "In order to publish your circuit, you need to save and validate it (author race time)."}
    </span></PointerzConfirm>
</div>

<style>
  .actionsMenuContainer {
    position: absolute;
    top: 8px;
    left: 8px;
    display: grid;
    grid-auto-flow: row;
    grid-gap: 12px;
    border-radius: 8px;
    background-color: var(--over-container-blocks-bg);
    padding: 10px;
  }

  .actionContainer {
    display: inline-block;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .actionImage {
    width: 18px;
  }

  .actionImageState {
    width: 8px;
    margin: auto;
    display: block;
    margin-top: 2px;
  }

  .actionImageStateContainer {
    position: relative;
    top: -14px;
    right: -11px;
    background: var(--over-container-blocks-bg);
    padding: 2px;
    border-radius: 20px;
    width: 12px;
    height: 12px;
  }
</style>
