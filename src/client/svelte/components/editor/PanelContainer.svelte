<script>
  // The live ranking tab component
  import { scale } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { Client, editorSelectedBlock } from "../../misc/store";

  import BlockPropertiesPanel from "./BlockPropertiesPanel.svelte";

  var selectedPredefinedBlockConstants = {};
  var selectedBlockPropertiesList = [];
  var selectedBlockComponents = [];

  Client.svelte.updateSelectedBlock = function () {
    $editorSelectedBlock = Client.phaser.editor.selectedBlock;
    if ($editorSelectedBlock) {
      // For reactivity on array and objects
      selectedBlockComponents = $editorSelectedBlock.components;
      selectedPredefinedBlockConstants =
        $editorSelectedBlock.predefinedEditorBlockType;
      selectedPredefinedBlockConstants &&
        (selectedBlockPropertiesList =
          selectedPredefinedBlockConstants.PROPERTIES);
    } else {
      selectedPredefinedBlockConstants = {};
      selectedBlockPropertiesList = [];
      selectedBlockComponents = [];
    }
  };

  Client.svelte.updateSelectedBlock();
</script>

{#if $editorSelectedBlock && $editorSelectedBlock.predefinedEditorBlockType}
  <div class="panelsContainer" transition:scale>
    <BlockPropertiesPanel
      selectedElement={$editorSelectedBlock}
      {selectedPredefinedBlockConstants}
      {selectedBlockPropertiesList}
    />
  </div>
{/if}

{#if $editorSelectedBlock && !$editorSelectedBlock.predefinedEditorBlockType}
  <div class="panelsContainer" transition:scale>
    {#each selectedBlockComponents as selectedBlockComponent, index ($editorSelectedBlock._id + selectedBlockComponent._id)}
      <div animate:flip={{}}>
        <BlockPropertiesPanel
          isComponent
          componentIndex={index}
          canMoveUp={index > 0}
          canMoveDown={index < $editorSelectedBlock.components.length - 1}
          canDelete={$editorSelectedBlock.components.length > 1}
          selectedElement={selectedBlockComponent}
        />
      </div>
    {/each}
  </div>
{/if}

<style>
  .panelsContainer {
    position: absolute;
    top: 16px;
    right: 16px;
  }
</style>
