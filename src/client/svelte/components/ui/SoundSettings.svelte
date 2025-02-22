<script>
  import { Client } from "../../misc/store";
  import { slide } from "svelte/transition";

  export let open = false;
  export let onClose = () => {};

  // Current values
  let musicVolume = Client.musicVolume;
  let soundVolume = Client.soundVolume;

  // Update music volume
  function updateMusicVolume(event) {
    const value = parseFloat(event.target.value) / 100;
    Client.setMusicVolume(value);
    musicVolume = Client.musicVolume;
  }

  // Update sound effects volume
  function updateSoundVolume(event) {
    const value = parseFloat(event.target.value) / 100;
    Client.setSoundVolume(value);
    soundVolume = Client.soundVolume;
  }
</script>

{#if open}
  <div class="sound-settings" transition:slide={{ duration: 200 }}>
    <div class="panel-header">
      <span>Sound Settings</span>
      <button class="close-button" on:click={onClose}>
        <img
          src="assets/images/connection/close.png"
          alt="Close"
          class="close-icon" />
      </button>
    </div>
    <div class="setting-row">
      <span class="label">Music Volume</span>
      <input
        type="range"
        min="0"
        max="100"
        value={musicVolume * 100}
        on:input={updateMusicVolume}
        class="volume-slider" />
      <span class="volume-value">{Math.round(musicVolume * 100)}%</span>
    </div>

    <div class="setting-row">
      <span class="label">Sounds Volume</span>
      <input
        type="range"
        min="0"
        max="100"
        value={soundVolume * 100}
        on:input={updateSoundVolume}
        class="volume-slider" />
      <span class="volume-value">{Math.round(soundVolume * 100)}%</span>
    </div>
  </div>
{/if}

<style>
  .sound-settings {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    position: absolute;
    left: 0px;
    background-color: var(--over-container-blocks-bg);
    color: var(--almost-white-color);
    border-radius: 8px;
    top: 52px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .label {
    min-width: 120px;
    color: var(--text-color);
    font-family: "Nunito";
    text-align: left;
  }

  .volume-slider {
    flex: 1;
    height: 20px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(47, 47, 47, 0.9);
    border-radius: 10px;
    outline: none;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: hsl(25, 65%, 40%);
    border-radius: 50%;
    cursor: pointer;
  }

  .volume-value {
    min-width: 50px;
    text-align: right;
    color: var(--text-color);
    font-family: "Nunito";
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-family: "virgo";
    color: var(--text-color);
    font-size: 22px;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .close-icon {
    width: 16px;
    height: 16px;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .close-button:hover .close-icon {
    opacity: 1;
  }
</style>
