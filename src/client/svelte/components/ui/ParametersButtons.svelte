<script>
  import SoundSettings from "./SoundSettings.svelte";
  export let backHref = undefined;
  import { push } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import { Client } from "../../misc/store";

  export let showBackButton = true;
  export let showLogOutButton = true;
  export let showSoundSettings = true;

  let soundSettingsPanelOpen = false;

  function toggleSoundSettings() {
    Client.phaser.playSound("buttonClick");
    soundSettingsPanelOpen = !soundSettingsPanelOpen;
  }

  function closeSoundSettings() {
    soundSettingsPanelOpen = false;
  }

  export let goBack = function () {
    push(backHref);
  };

  function goBackWithSound() {
    Client.phaser.playSound("cancelClick");
    goBack();
  }

  function logOut() {
    Client.phaser.playSound("cancelClick");
    push("/");
    setTimeout(() => {
      location.reload();
    }, 800);
  }
</script>

<div class="actionsContainer" in:fade={{ delay: 800, duration: 100 }}>
  {#if showBackButton}
    <div class="imageContainer" on:click={goBackWithSound}>
      <img
        class="actionImage"
        alt="actionImage"
        src="../../../assets/images/editorCircuitActions/back.png" />
    </div>
  {/if}
  {#if showLogOutButton}
    <div class="imageContainer" on:click={logOut}>
      <img
        class="actionImage"
        alt="actionImage"
        src="../../../assets/images/menu/log-out.png" />
    </div>
  {/if}
  {#if showSoundSettings}
    <div class="panelImageContainer">
      <div class="imageContainer" on:click={toggleSoundSettings}>
        <img
          class="actionImage"
          alt="actionImage"
          src="../../../assets/images/menu/soundSettings.png" />
      </div>
      <SoundSettings
        open={soundSettingsPanelOpen}
        onClose={closeSoundSettings} />
    </div>
  {/if}
</div>

<style>
  .panelImageContainer {
    position: relative;
  }

  .actionsContainer {
    display: grid;
    position: absolute;
    top: 12px;
    left: 12px;
    grid-auto-flow: column;
    grid-gap: 12px;
  }

  .imageContainer {
    display: grid;
    grid-auto-flow: row;
    grid-gap: 12px;
    border-radius: 8px;
    background-color: var(--over-container-blocks-bg);
    padding: 10px;
    cursor: pointer;
  }

  .actionImage {
    width: 24px;
  }
</style>
