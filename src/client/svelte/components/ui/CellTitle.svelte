<script>
  import TextBlock from "./TextBlock.svelte";
  export let imagePath = "";
  export let color;
  export let small = false;
  export let noMargins = false;
  export let style = "";
</script>

<TextBlock style="text-align:center;{style}" {color} {small} {noMargins}>
  {#if imagePath}
    <img
      class="titleImage {small ? 'smallImage' : ''}"
      alt="titleImage"
      src={imagePath}
    />
  {/if}
  <span class="cellTitle {small ? 'smallTitle' : ''}">
    <slot />
  </span>
</TextBlock>

<style>
  .cellTitle {
    font-family: Virgo;
    font-size: 24px;
    display: inline-block;
  }

  .smallTitle {
    font-family: "Nunito ExtraBold";
    font-size: 20px;
  }

  .titleImage {
    vertical-align: middle;
    height: 28px;
    width: auto;
    margin-right: 6px;
    margin-top: -6px;
  }

  .smallImage {
    height: 20px;
    width: auto;
    margin-right: 4px;
    margin-top: -6px;
  }
</style>
