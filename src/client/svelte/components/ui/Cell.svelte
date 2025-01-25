<script>
  import CellTitle from "./CellTitle.svelte";
  import { css } from "../../misc/css";
  export let title = "";
  export let titleImagePath = "";
  export let color = "blue";
  export let style = "";
  export let titleStyle = "";
  export let noMargin = false;

  export let noMarginTop = noMargin;
  export let noMarginRight = noMargin;
  export let noMarginLeft = noMargin;
  export let noMarginBottom = noMargin;
</script>

<div
  class="cell"
  style="
    padding-left: {noMarginLeft ? 0 : css.default.margin}px;
    padding-right: {noMarginRight ? 0 : css.default.margin}px;
    padding-top: {noMarginTop ? 0 : css.default.margin}px;
    padding-bottom: {noMarginBottom ? 0 : css.default.margin}px;
    {style} 
  "
>
  {#if title}
    <CellTitle imagePath={titleImagePath} {color} style={titleStyle}
      >{title}</CellTitle
    >
  {/if}
  <slot />
</div>

<style>
  .cell {
    box-sizing: border-box;
    border-radius: 8px;
    background: none;
    vertical-align: top;
    width: 100%;
  }
</style>
