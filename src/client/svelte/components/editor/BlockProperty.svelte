<script>
  // The live ranking tab component
  import { Client, editorSelectedBlock } from "../../misc/store";

  import PointerzInput from "../ui/PointerzInput.svelte";
  import PointerzSelect from "../ui/PointerzSelect.svelte";
  import PointerzCheckbox from "../ui/PointerzCheckbox.svelte";

  export let property;
  export let formatPropertyName;
  export let parent = $editorSelectedBlock;

  var blockPropertiesComponentType = {
    environment: "list",
    right_side: "checkbox",
    left_side: "checkbox",
  };

  var blockPropertiesValueLists = {};
  let environmentValueList = [];
  for (let environment in Client.race.Constants.environments) {
    environmentValueList.push({
      label: formatPropertyName(environment),
      value: Client.race.Constants.environments[environment],
    });
  }
  blockPropertiesValueLists.environment = environmentValueList;

  let changeProperty = function (propertyName, newValue) {
    Client.phaser.editor.setSelectedProperty(parent, propertyName, newValue);
  };
</script>

{#if blockPropertiesComponentType[property] == "list"}
  <PointerzSelect
    label={formatPropertyName(property)}
    items={blockPropertiesValueLists[property]}
    value={{ value: parent[property] }}
    on:change={(event) => {
      changeProperty(property, event.detail.value);
    }}
  />
{:else if blockPropertiesComponentType[property] == "checkbox"}
  <PointerzCheckbox
    label={formatPropertyName(property)}
    value={parent[property]}
    on:change={(event) => {
      changeProperty(property, event.detail.value);
    }}
  />
{:else}
  <PointerzInput
    label={formatPropertyName(property)}
    placeholder={formatPropertyName(property)}
    value={parent[property]}
    on:change={(event) => {
      changeProperty(property, event.detail.value);
    }}
    editorInput
  />
{/if}
