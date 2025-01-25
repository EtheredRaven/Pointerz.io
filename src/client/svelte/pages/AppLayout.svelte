<script>
  import { infoInfo, infoError, loggedIn } from "../misc/store";
  import { css } from "../misc/css";
  import { fade } from "svelte/transition";
  import ClosableDislay from "../components/ui/ClosableDisplay.svelte";
  import KoinosWallet from "../components/ui/KoinosWallet.svelte";

  let appMargin = Math.max(
    css.uiContainer.minMargin,
    Math.min(
      css.uiContainer.maxMargin,
      ((window.innerWidth - css.publicMenu.minWidth) /
        (css.publicMenu.maxWidth - css.publicMenu.minWidth)) *
        (css.uiContainer.maxMargin - css.uiContainer.minMargin) +
        css.uiContainer.minMargin
    )
  );
</script>

<main>
  {#if $loggedIn}
    <KoinosWallet />
  {/if}
  <div
    id="uiContainer"
    in:fade={{ delay: 400, duration: 400 }}
    out:fade={{ duration: 400 }}>
    <div id="titleContainer">
      <div
        id="title"
        style="font-size:{Math.min((window.innerWidth * 30) / 350, 46)}px">
        <span style="color:hsl(0,65%,40%)">P</span>
        <span style="color:hsl(34,65%,40%)">o</span>
        <span style="color:hsl(68,65%,40%)">i</span>
        <span style="color:hsl(102,65%,40%)">n</span>
        <span style="color:hsl(136,65%,40%)">t</span>
        <span style="color:hsl(170,65%,40%)">e</span>
        <span style="color:hsl(204,65%,40%)">r</span>
        <span style="color:hsl(238,65%,40%)">z</span>
        <span style="color:hsl(272,65%,40%)">.</span>
        <span style="color:hsl(306,65%,40%)">i</span>
        <span style="color:hsl(340,65%,40%)">o</span>
      </div>
    </div>
    <div
      id="totalContainer"
      style="
          margin-left:{appMargin}px;
          margin-right:{appMargin}px;">
      <slot />
    </div>
  </div>
</main>

<style>
  main {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0 auto;
  }

  #uiContainer {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 1;
    transition: opacity 1s;
    background-color: var(--almost-black-color);
    text-align: center;
    overflow-y: auto;
    overflow-x: hidden;
  }

  #titleContainer {
    width: 100%;
    text-align: center;
  }

  #title {
    margin-top: 160px;
    margin-bottom: 48px;
    color: var(--almost-white-color);
    font-family: TheShapeOfThings;
    display: inline-block;
    text-align: center;
  }

  #totalContainer {
    display: block;
  }

  @keyframes sizePulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  #title span {
    display: inline-block;
    animation: sizePulse 2s ease-in-out infinite;
  }

  #title span:nth-child(1) {
    animation-delay: 0s;
  }
  #title span:nth-child(2) {
    animation-delay: 0s;
  }
  #title span:nth-child(3) {
    animation-delay: 0s;
  }
  #title span:nth-child(4) {
    animation-delay: 0s;
  }
  #title span:nth-child(5) {
    animation-delay: 0s;
  }
  #title span:nth-child(6) {
    animation-delay: 0s;
  }
  #title span:nth-child(7) {
    animation-delay: 0s;
  }
  #title span:nth-child(8) {
    animation-delay: 0s;
  }
  #title span:nth-child(9) {
    animation-delay: 0s;
  }
  #title span:nth-child(10) {
    animation-delay: 0s;
  }
  #title span:nth-child(11) {
    animation-delay: 0s;
  }
</style>
