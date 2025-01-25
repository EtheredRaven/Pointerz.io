<script>
  import Checkbox from "svelte-checkbox";
  import { css } from "../../misc/css";
  import { createEventDispatcher } from "svelte";
  import Label from "./Label.svelte";
  import { Client } from "../../misc/store";

  const dispatch = createEventDispatcher();

  export let label;
  export let value;

  function forwardChangeEvent(event) {
    Client.phaser.playSound("checking");
    value = event.detail;
    dispatch("change", { value: value });
  }
</script>

<Label {label}>
  <div
    class="checkboxContainer"
    style="margin-bottom:{css.default.margin - 4}px;margin-top:2px;">
    <Checkbox
      checked={value}
      id={label + "Checkbox"}
      on:change={forwardChangeEvent}
      size="20px"
      primaryColor="#dddbdb"
      secondaryColor="#dddbdb" />
    <span class="checkboxValueLabel">{value ? "Closed" : "Opened"}</span>
  </div>
</Label>

<style>
  .checkboxContainer {
    grid-column-start: 2;
    grid-column-end: 3;
    width: 100%;
    padding-top: 2px;
    padding-bottom: 2px;
  }

  :global(.checkbox) {
    display: inline-block;
  }

  .checkboxValueLabel {
    font-size: 12px;
    display: inline-block;
    vertical-align: text-top;
    margin-left: 4px;
    margin-top: -2px;
    font-family: "Nunito Bold";
    color: var(--almost-white-color);
  }
</style>
