<script>
  export let flexWrap = undefined;
  export let justifyContent = undefined;
  export let flexFlow = undefined;
  let computedStyle = flexWrap ? "flex-wrap:" + flexWrap + ";" : "";
  computedStyle += justifyContent
    ? "justify-content:" + justifyContent + ";"
    : "";
  computedStyle += flexFlow ? "flex-flow:" + flexFlow + ";" : "";
</script>

<style>
  .flexContainer {
    display: flex;
  }
</style>

<div class="flexContainer" style={computedStyle}>
  <slot />
</div>
