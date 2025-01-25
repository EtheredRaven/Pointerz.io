<script>
  import Select from "svelte-select";
  import { createEventDispatcher } from "svelte";
  import { css } from "../../misc/css";
  import Label from "./Label.svelte";

  const dispatch = createEventDispatcher();

  export let items = [];
  export let value;
  export let label;

  let passedValue = value;

  function handleSelect(event) {
    value = event.detail;
    dispatch("change", { value: event.detail.value });
  }
</script>

<Label {label}>
  <div
    class="selectLowerContainer"
    style="margin-bottom:{css.default.margin}px;">
    <Select
      value={passedValue}
      {items}
      isClearable={false}
      isSearchable={false}
      on:select={handleSelect} />
  </div>
</Label>

<style>
  .selectLowerContainer {
    display: grid !important;
    grid-column-start: 2 !important;
    grid-column-end: 3 !important;
    width: 100% !important;
  }

  :global(.selectedItem) {
    margin: auto;
  }

  :global(.selectContainer) {
    font-size: 12px;
    font-family: "Nunito Bold";
    text-align: center;
    --height: 28px;
    --color: var(--almost-white-color);
    --inputColor: var(--almost-white-color);
    --itemColor: var(--almost-white-color);
    --itemIsActiveColor: var(--almost-white-color);
    --itemHoverColor: var(--almost-white-color);
    --listBorderRadius: 8px;
    --borderRadius: 8px;
    --selectedItemPadding: 0px;
    --background: #1c1c1c;
    --listBackground: #1c1c1c;
    --fontSize: 12px;
    --border: none;
    --padding: 0 16px;
    --selectedItemPadding: 0px;
    --itemHoverBG: #2c2c2c;
    --itemIsActiveBG: #2466a8;
    --listShadow: 0 2px 3px 0 #2c2c2ccc;
    --indicatorTop: 4px;
  }
</style>
