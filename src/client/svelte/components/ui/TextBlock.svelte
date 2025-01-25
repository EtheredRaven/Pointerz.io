<script>
  import { slide } from "svelte/transition";

  export let color = "grey";
  import { css } from "../../misc/css";
  export let width = false;
  export let clickable = false;
  export let slideTransition = false;
  export let style = width ? "width:" + width + "%;" : "";
  export let small = false;
  export let noMargins = false;

  export let elementsPerRow = 1;
  export let lastElementOfRow = elementsPerRow == 1 ? true : false;
  export let lastRow = false;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<div
  on:click={() => {
    dispatch("click");
  }}
  class="textBlock {color} {clickable ? 'clickable' : ''} {small
    ? 'smallPadding'
    : ''} {noMargins ? 'noMargins' : ''}"
  style="
    {style}
    width: {'calc(' +
    100 / elementsPerRow +
    '% - ' +
    (css.default.margin * (elementsPerRow - 1)) / elementsPerRow +
    'px)'};
    margin-right: {lastElementOfRow ? 0 : css.default.margin}px;
    margin-bottom: {(lastRow ? 0 : css.default.margin) + 4}px;
  "
  transition:slide={slideTransition}>
  <slot />
</div>

<style>
  .textBlock {
    display: inline-block;
    text-align: left;
    font-family: Nunito;
    border-radius: 8px;
    padding: 12px 12px;
    font-size: 18px;
    color: white;
    box-sizing: border-box;
    transition: all 0.15s ease-in;
  }

  .noMargins {
    margin-left: 0;
    margin-right: 0;
  }

  .smallPadding {
    padding: 6px 12px;
  }

  .pink {
    background: var(--pink-color);
    box-shadow: 0 4px var(--pink-shadow-color);
  }

  .blue {
    background: var(--blue-color);
    box-shadow: 0 4px var(--blue-shadow-color);
  }

  .darkBlue {
    background: var(--dark-blue-color);
    box-shadow: 0 4px var(--dark-blue-shadow-color);
  }

  .red {
    background-color: var(--red-color);
    box-shadow: 0 4px var(--red-shadow-color);
  }

  .green {
    background: var(--green-color);
    box-shadow: 0 4px var(--green-shadow-color);
  }

  .orange {
    background: var(--orange-color);
    box-shadow: 0 4px var(--orange-shadow-color);
  }

  .darkOrange {
    background: var(--dark-orange-color);
    box-shadow: 0 4px var(--dark-orange-shadow-color);
  }

  .darkGreen {
    background: var(--dark-green-color);
    box-shadow: 0 4px var(--dark-green-shadow-color);
  }

  .grey {
    background: var(--grey-color);
    box-shadow: 0 4px var(--grey-shadow-color);
  }

  .darkGrey {
    background: var(--dark-grey-color);
    box-shadow: 0 4px var(--dark-grey-shadow-color);
  }

  .clickable {
    cursor: pointer;
  }
</style>
