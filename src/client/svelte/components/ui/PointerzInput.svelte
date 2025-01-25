<script>
  import { css } from "../../misc/css";
  import { createEventDispatcher } from "svelte";
  import Label from "./Label.svelte";

  const dispatch = createEventDispatcher();
  function forwardChangeEvent(event) {
    dispatch("change", { value: event.target.value });
  }

  export let value = "";
  export let maxlength = 100;
  export let placeholder = undefined;
  export let type = "text";
  export let editorInput = false;
  export let label;
</script>

<Label {label}>
  {#if type == "text"}
    <input
      type="text"
      {placeholder}
      {maxlength}
      bind:value
      class="pointerzInput {editorInput && 'editorInput'}"
      style="margin-bottom:{css.default.margin}px;"
      on:change={forwardChangeEvent} />
  {:else if type == "password"}
    <input
      type="password"
      {placeholder}
      {maxlength}
      bind:value
      class="pointerzInput {editorInput && 'editorInput'}"
      style="margin-bottom:{css.default.margin}px;"
      on:change={forwardChangeEvent} />
  {:else if type == "mail"}
    <input
      type="mail"
      {placeholder}
      {maxlength}
      bind:value
      class="pointerzInput {editorInput && 'editorInput'}"
      style="margin-bottom:{css.default.margin}px;"
      on:change={forwardChangeEvent} />
  {/if}
</Label>

<style>
  .pointerzInput {
    background-color: var(--almost-white-color);
    border-radius: 8px;
    font-size: 20px;
    color: var(--almost-black-color);
    padding: 0 16px;
    height: 48px;
    border: none;
    width: 100%;
    font-family: "Nunito Bold";
    box-sizing: border-box;
    text-align: center;
  }

  .editorInput {
    display: grid;
    grid-column-start: 2;
    grid-column-end: 3;
    height: 28px;
    font-size: 12px;
    background-color: var(--container-blocks-bg);
    color: var(--almost-white-color);
  }

  ::placeholder {
    color: var(--light-grey-color);
  }

  .pointerzInput:focus {
    outline: none;
  }
</style>
