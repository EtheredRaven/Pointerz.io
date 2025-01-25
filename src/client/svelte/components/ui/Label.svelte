<script>
  import { css } from "../../misc/css";
  export let label;
</script>

<div class={label ? "inputLabelContainer" : ""}>
  {#if label}
    <div style="margin-bottom:{css.default.margin}px;">
      <div class="panelLabel">{label}</div>
    </div>
  {/if}
  <slot />
</div>

<style>
  .inputLabelContainer {
    display: grid;
    grid-template-columns: 84px;
  }

  .panelLabel {
    margin-top: 6px;
    font-size: 12px;
    color: var(--almost-white-color);
  }
</style>
