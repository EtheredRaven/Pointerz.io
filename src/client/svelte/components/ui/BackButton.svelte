<script>
  export let backHref = undefined;
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import { Client } from "../../misc/store";

  export let goBack = function () {
    push(backHref);
  };

  function goBackWithSound() {
    Client.phaser.playSound("cancelClick");
    goBack();
  }
</script>

<div
  class="actionsMenuContainer"
  in:fade={{ delay: 800, duration: 100 }}
  on:click={goBackWithSound}>
  <div class="actionContainer">
    <img
      class="actionImage"
      alt="actionImage"
      src="../../../assets/images/editorCircuitActions/back.png" />
  </div>
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
    cursor: pointer;
  }

  .actionContainer {
    display: inline-block;
    width: 18px;
    height: 18px;
  }

  .actionImage {
    width: 18px;
  }
</style>
