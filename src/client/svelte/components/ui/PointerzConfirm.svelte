<script>
  import { fly, fade } from "svelte/transition";
  import { Client } from "../../misc/store";
  export let confirmTitle = "Confirm";
  export let cancelTitle = "Cancel";
  export let color = "red";
  export let cancelFunction = () => {};
  export let showConfirm = true;

  let showDialog = false;
  // Play the warning window sound when the confirm dialog is shown
  $: if (showDialog) {
    Client.phaser.playSound("warningWindow");
  }

  let functionToCall = {
    func: null,
    args: null,
  };

  function callFunction() {
    Client.phaser.playSound("buttonClick");
    showDialog = false;
    functionToCall["func"](...functionToCall["args"]);
  }

  function callCancelFunction() {
    showConfirm && Client.phaser.playSound("cancelClick");
    showDialog = false;
    cancelFunction();
  }

  function confirm(func, ...args) {
    functionToCall = { func, args };
    showDialog = showConfirm;
    !showConfirm && callCancelFunction();
  }
</script>

<slot {confirm} />

{#if showDialog}
  <div
    class="overlay"
    in:fade={{ duration: 200 }}
    out:fade={{ delay: 200, duration: 200 }}>
    <div
      class={"confirm-dialog " + color}
      in:fly={{
        y: -10,
        delay: 200,
        duration: 200,
      }}
      out:fly={{
        y: -10,
        duration: 200,
      }}>
      <div class="message-section">
        <span class="message-title">
          <slot name="title"
            >Are you sure you want to perform this action?</slot>
        </span>
        <span class="message-description">
          <slot name="description" />
        </span>
      </div>
      <div class="actions">
        <button class="modal-button" on:mousedown={callFunction}>
          <slot name="confirm">
            {confirmTitle}
          </slot>
        </button>
        <button
          class="modal-button cancel-button"
          on:mousedown={callCancelFunction}>
          <slot name="cancel">
            {cancelTitle}
          </slot>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .red {
    --actions-bg-color: var(--red-color);
    --actions-box-shadow: var(--red-shadow-color);
    --confirm-btn-bg: var(--red-shadow-color);
    --confirm-btn-bg-hover: var(--red-shadow-color);
    --modal-text-color: #dddbdb;
    --cancel-btn-color: #dddbdb;
    --cancel-btn-color-hover: #dddbdb;
    --confirm-btn-color: #dddbdb;
  }

  .green {
    --actions-bg-color: var(--green-color);
    --actions-box-shadow: var(--green-shadow-color);
    --confirm-btn-bg: var(--green-shadow-color);
    --confirm-btn-bg-hover: var(--green-shadow-color);
    --modal-text-color: var(--almost-white-color);
    --cancel-btn-color: var(--almost-white-color);
    --cancel-btn-color-hover: var(--almost-white-color);
    --confirm-btn-color: var(--almost-white-color);
  }

  .grey {
    --actions-bg-color: var(--grey-color);
    --actions-box-shadow: var(--grey-shadow-color);
    --confirm-btn-bg: var(--grey-shadow-color);
    --confirm-btn-bg-hover: var(--grey-shadow-color);
    --modal-text-color: var(--almost-white-color);
    --cancel-btn-color: var(--almost-white-color);
    --cancel-btn-color-hover: var(--almost-white-color);
    --confirm-btn-color: var(--almost-white-color);
  }

  .message-title {
    font-size: 22px;
    font-weight: 500;
    display: block;
    color: var(--modal-text-color);
    line-height: 1.2;
    font-family: "virgo";
  }

  .message-description {
    display: block;
    margin-top: 20px;
    font-size: 16px;
    color: var(--modal-text-color);
    line-height: 1.4;
  }

  .actions {
    border-radius: 8px;
    background-color: var(--actions-bg-color);
    box-shadow: 0 4px var(--actions-box-shadow);
    margin: 0px -24px -30px;
    display: grid;
    padding: 15px 20px;
    padding-bottom: 18px;
    padding-top: 18px;
    transition:
      background-color 0.3s ease,
      box-shadow 0.3s ease;
    grid-auto-flow: column;
    justify-content: flex-start;
    gap: 16px;
  }

  .confirm-dialog {
    font-family: "Nunito Bold";
    position: absolute;
    z-index: 999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 24px 24px;
    border-radius: 8px;
    background-color: var(--actions-bg-color);
    max-width: 500px;
    width: calc(100% - 20px);
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }

  .overlay {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: fixed;
    user-select: none;
    z-index: 998;
    background: var(--overlay-bg);
    transition: background 0.3s ease;
  }

  .modal-button {
    background: var(--confirm-btn-bg);
    border: none;
    outline: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 16px;
    color: var(--confirm-btn-color);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 8px !important;
    font-family: "NUNITO" !important;
    min-width: 120px;
  }

  .cancel-button {
    border: 1px solid var(--cancel-btn-color);
    background: transparent;
  }

  .modal-button:hover {
    background: var(--confirm-btn-bg-hover);
    transform: scale(1.05);
  }

  .modal-button:active {
    transform: scale(0.95);
  }

  .close {
    position: absolute;
    right: -6px;
    top: -12px;
    font-size: 24px;
    cursor: pointer;
    color: var(--modal-text-color);
    transition: transform 0.3s ease;
  }

  .close:hover {
    transform: rotate(90deg);
  }
</style>
