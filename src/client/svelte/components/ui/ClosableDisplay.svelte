<script>
  import { slide } from "svelte/transition";
  import Cell from "./Cell.svelte";
  import TextBlock from "./TextBlock.svelte";
  import { Client } from "../../misc/store";
  export let color = "green";
  export let width = 100;
  export let imagePath = false;
  export let displayedText = false;
  export let sound;
  let autoCloseTimer = false;

  $: {
    displayedTextChanger(displayedText);
  }

  function displayedTextChanger(newDisplayedText) {
    if (sound && newDisplayedText) {
      Client.phaser.playSound(sound);
    }
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      close();
      clearTimeout(autoCloseTimer);
    }, 3000);
  }

  function close() {
    displayedText = false;
  }
</script>

{#if displayedText}
  <div class="closableDisplay" transition:slide>
    <Cell style="width:fit-content;margin:auto;">
      <TextBlock {color} {width}>
        {#if imagePath}
          <img alt="closableImage" src={imagePath} class="closableImage" />
        {/if}
        {displayedText}
        <img
          alt="close"
          src="assets/images/connection/close.png"
          class="closingCross"
          on:click={() => close()} />
      </TextBlock>
    </Cell>
  </div>
{/if}

<style>
  .closableDisplay {
    width: 100%;
  }

  .closableImage {
    float: left;
    vertical-align: middle;
    width: 28px;
    height: auto;
    margin-right: 16px;
    margin-top: -2px;
  }

  .closingCross {
    height: 14px;
    width: auto;
    vertical-align: top;
    cursor: pointer;
    float: right;
    margin-left: 16px;
    transition: transform 0.3s ease;
  }

  .closingCross:hover {
    transform: rotate(90deg);
  }
</style>
