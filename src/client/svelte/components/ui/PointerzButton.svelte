<script>
  import { createEventDispatcher } from "svelte";
  import { css } from "../../misc/css";
  const dispatch = createEventDispatcher();
  export let multicolor = false;
  export let important = false;
  export let imagePath = false;
  export let imageOnly = false;
  export let imageHeight = "24px";
  export let animateImage = true;
  export let buttonColor = "";
  export let animating = false;
  export let fullHeight = false;
  export let clickable = true;
  export let noSound = false;
  export let noShadow = false;
  export let outline = false;

  export let elementsPerRow = 1;
  export let lastElementOfRow = elementsPerRow == 1 ? true : false;
  export let lastRow = false;

  export let noMargins = false;

  let multicolorClass = multicolor ? "multicolorButton" : "";
  let importantClass = important ? "importantButton" : "";
  let noShadowClass = noShadow ? "noShadow" : "";

  function proceedClick() {
    !noSound && Client.phaser.playSound("buttonClick");
    dispatch("click");
  }

  function getLighterColor(buttonColor) {
    if (!buttonColor) return "";
    // If it starts with 'dark', remove it and use the base color
    if (buttonColor.startsWith("dark")) {
      return buttonColor.replace("dark", "").toLowerCase();
    }
    // For non-dark colors, return the same color
    return buttonColor.toLowerCase();
  }

  function getShadowVar(buttonColor) {
    const lighterColor = getLighterColor(buttonColor);
    if (!lighterColor) return "";
    // Use the shadow color of the lighter version
    return `var(--${lighterColor}-shadow-color)`;
  }
</script>

<button
  class="{multicolorClass} {importantClass} {buttonColor} {noShadowClass} {animating
    ? 'animatingHover'
    : ''} {clickable ? '' : 'unclickable'} {outline ? 'outline' : ''}"
  style="
    --button-hover-color: {getShadowVar(buttonColor)};
    width: {'calc(' +
    100 / elementsPerRow +
    '% - ' +
    (css.default.margin * (elementsPerRow - 1)) / elementsPerRow +
    'px)'};
    margin-right: {lastElementOfRow || noMargins ? 0 : css.default.margin}px;
    margin-bottom: {(lastRow || noMargins ? 0 : css.default.margin) + 4}px;
    {fullHeight ? 'height: 100%' : ''}
  "
  on:mousedown={proceedClick}>
  <p>
    {#if imagePath}
      <img
        alt="buttonImage"
        src={imagePath}
        class="buttonImage {important ? 'importantButtonImage' : ''} {imageOnly
          ? 'imageOnly'
          : ''}"
        style="height: {imageHeight}; {animateImage
          ? 'animation: growing 1s;'
          : ''}" />
    {/if}
    <slot />
  </p>
</button>

<style>
  @keyframes growing {
    0% {
      transform: scale(1);
      -webkit-transform: scale(1);
    }
    50% {
      transform: scale(1.2);
      -webkit-transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      -webkit-transform: scale(1);
    }
  }

  button {
    text-align: left;
    color: var(--white-color);
    font-family: "Nunito Bold";
    font-size: 20px;
    border: none;
    height: auto;
    min-height: 44px;
    border-radius: 8px;
    cursor: pointer;
    padding: 4px 10px;
    box-sizing: border-box;
    transition: all 0.15s ease;
    overflow: hidden;
    position: relative;
  }

  button > p {
    position: relative;
    margin: 0;
  }

  button:focus {
    outline: none;
  }

  .orange {
    background: var(--orange-color);
    box-shadow: 0 4px var(--orange-shadow-color);
  }

  .darkOrange {
    background: var(--dark-orange-color);
    box-shadow: 0 4px var(--dark-orange-shadow-color);
  }

  .grey {
    background: var(--grey-color);
    box-shadow: 0 4px var(--grey-shadow-color);
  }

  .darkGrey {
    background: var(--dark-grey-color);
    box-shadow: 0 4px var(--dark-grey-shadow-color);
  }

  .green {
    background-color: var(--green-color);
    box-shadow: 0 4px var(--green-shadow-color);
  }

  .darkGreen {
    background-color: var(--dark-green-color);
    box-shadow: 0 4px var(--dark-green-shadow-color);
  }

  .blue {
    background-color: var(--blue-color);
    box-shadow: 0 4px var(--blue-shadow-color);
  }

  .darkBlue {
    background: var(--dark-blue-color);
    box-shadow: 0 4px var(--dark-blue-shadow-color);
  }

  .darkDarkBlue {
    background: var(--dark-blue-shadow-color);
  }

  .purple {
    background-color: var(--purple-color);
    box-shadow: 0 4px var(--purple-shadow-color);
  }

  .red {
    background-color: var(--red-color);
    box-shadow: 0 4px var(--red-shadow-color);
  }

  .darkRed {
    background-color: var(--dark-red-color);
    box-shadow: 0 4px var(--dark-red-shadow-color);
  }

  .multicolorButton {
    animation: colorchange 17s;
    animation-iteration-count: infinite;
    animation-timing-function: ease;
  }

  .importantButton {
    text-align: center;
    text-transform: uppercase;
    font-family: virgo;
    font-size: 22px;
  }

  .buttonImage {
    vertical-align: middle;
    width: auto;
    margin-right: 8px;
    float: left;
    animation-iteration-count: infinite;
    animation-timing-function: ease;
  }

  .importantButtonImage {
    float: none;
    margin-right: 0px;
  }

  .animatingHover {
    transition: box-shadow 0.5s ease;
  }

  .animatingHover:hover {
    box-shadow: 0 4px var(--button-shadow-color);
  }

  .animatingHover:active {
    box-shadow: none;
  }

  .animatingHover:before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    transition: all 0.5s ease;
    background-color: var(--button-hover-color);
    opacity: 0.8;
  }

  .animatingHover:before {
    top: 0;
    left: -100%;
  }

  .animatingHover:hover:before,
  .animatingHover:active:before {
    left: 0;
  }

  /* Add this to keep content visible */
  button > p {
    position: relative;
  }

  button:active {
    box-shadow: none;
    bottom: -4px;
    transition: all 0.15s ease;
  }

  .unclickable {
    pointer-events: none;
    box-shadow: none;
  }

  .imageOnly {
    margin-right: 0px;
  }

  .noShadow {
    box-shadow: none;
  }

  .outline {
    background: none;
    border: 1px solid var(--white-color);
    color: var(--white-color);
  }
</style>
