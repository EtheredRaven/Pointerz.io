<script>
  // The live ranking tab component
  import { Client } from "../../misc/store";
  import { slide } from "svelte/transition";

  import BlockProperty from "./BlockProperty.svelte";
  import Cell from "../ui/Cell.svelte";

  export let selectedElement;
  export let selectedPredefinedBlockConstants = {};
  export let selectedBlockPropertiesList = [];
  var componentTypes = Client.race.Constants.componentTypes;

  export let isComponent = false;
  export let componentIndex;
  export let opened = !isComponent;
  export let canDelete = true;
  export let canMoveUp = true;
  export let canMoveDown = true;
  export let showAddMenu = false;

  let componentsTypeList = [];
  for (let componentName in Client.race.Constants.componentTypes) {
    componentsTypeList.push(componentName);
  }

  let formatPropertyName = function (propertyName) {
    return (
      propertyName.charAt(0).toUpperCase() + propertyName.slice(1).toLowerCase()
    ).replaceAll("_", " ");
  };

  let convertIntoCustom = function () {
    Client.phaser.playSound("blockSeparation");
    Client.phaser.editor.convertSelectedBlockIntoCustomBlock();
  };

  let moveComponentUp = function () {
    Client.phaser.playSound("blockModification");
    Client.phaser.editor.moveComponent(selectedElement, false);
  };
  let moveComponentDown = function () {
    Client.phaser.playSound("blockModification");
    Client.phaser.editor.moveComponent(selectedElement, true);
  };
  let deleteComponent = function () {
    Client.phaser.playSound("blockDeletion");
    Client.phaser.editor.deleteComponent(selectedElement);
  };
  let addComponent = function () {
    Client.phaser.playSound("checking");
    showAddMenu = true;
  };
  let addSelectedTypeComponent = function (selectedType) {
    Client.phaser.playSound("blockModification");
    showAddMenu = false;
    Client.phaser.editor.addComponent(selectedElement, selectedType);
  };
  let openOrClose = function () {
    Client.phaser.playSound("buttonSelection");
    opened = !opened;
  };
</script>

<div class="panel">
  <Cell>
    {#if isComponent}
      <div class="panelTitle" style={!opened && "margin-bottom: 0px;"}>
        <div class="leftCommandsContainer">
          <img
            alt="add"
            src="../../../assets/images/blockProperties/addComponent.png"
            class="panelTitleImage leftImage"
            on:click={addComponent} />
          {#if showAddMenu}
            <div class="showAddMenuContainer">
              {#each componentsTypeList as componentType}
                <div
                  class="showAddMenuComponent"
                  on:click={() => addSelectedTypeComponent(componentType)}
                  transition:slide>
                  {componentType}
                </div>
              {/each}
            </div>
          {/if}
          {#if canDelete}
            <img
              alt="delete"
              src="../../../assets/images/blockProperties/deleteComponent.png"
              class="panelTitleImage leftImage"
              on:click={deleteComponent} />
          {/if}
          {#if canMoveDown}
            <img
              alt="moveDown"
              src="../../../assets/images/blockProperties/moveComponent.png"
              class="panelTitleImage leftImage"
              on:click={moveComponentDown} />
          {/if}
          {#if canMoveUp}
            <img
              alt="moveUp"
              src="../../../assets/images/blockProperties/moveComponent.png"
              style="transform: rotate(180deg)"
              class="panelTitleImage leftImage"
              on:click={moveComponentUp} />
          {/if}
        </div>
        {formatPropertyName(selectedElement.shape)}
        <div class="rightCommandsContainer">
          <img
            alt="arrow"
            src="../../../assets/images/blockProperties/arrow.png"
            style={opened && "transform: rotate(180deg)"}
            class="panelTitleImage"
            on:click={openOrClose} />
        </div>
      </div>
      {#if opened}
        <div transition:slide>
          {#each componentTypes[selectedElement.shape].PROPERTIES as componentProperty, index (selectedElement._id + componentProperty)}
            <BlockProperty
              property={componentProperty}
              parent={selectedElement}
              {componentIndex}
              {formatPropertyName} />
          {/each}
        </div>
      {/if}
    {:else}
      <div class="panelTitle">
        {formatPropertyName(selectedPredefinedBlockConstants.TYPE)} block
        <img
          alt="customize"
          src="../../../assets/images/blockProperties/customize.png"
          class="customizeImage"
          on:click={convertIntoCustom} />
      </div>
      {#each selectedBlockPropertiesList as blockProperty, index (selectedElement._id + blockProperty)}
        <BlockProperty
          property={blockProperty}
          {formatPropertyName}
          parent={selectedElement} />
      {/each}
    {/if}
  </Cell>
</div>

<style>
  .showAddMenuContainer {
    position: absolute;
    top: 28px;
    width: 100px;
    background: var(--container-blocks-bg);
    z-index: 10;
    text-align: center;
    border-radius: 8px;
  }

  .showAddMenuComponent:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .showAddMenuContainer:last-of-type {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .showAddMenuComponent {
    width: 100%;
    color: var(--almost-white-color);
    font-size: 12px;
    margin: 0;
    padding: 4px 0px;
    cursor: pointer;
  }

  .showAddMenuComponent:hover {
    background: var(--over-container-blocks-bg);
    border-radius: 8px;
  }

  .panel {
    background-color: var(--over-container-blocks-bg);
    color: var(--almost-white-color);
    margin-bottom: 8px;
    border-radius: 8px;
    padding: 8px;
    padding-top: 0px;
    padding-bottom: 0px;
    width: 290px;
  }

  .panelTitle {
    font-variant: small-caps;
    font-size: 24px;
    margin-bottom: 16px;
    text-align: center;
    transition: margin 0.5s;
    position: relative;
  }

  .customizeImage {
    width: 18px;
    position: absolute;
    right: 14px;
    top: 10px;
    cursor: pointer;
  }

  .panelTitleImage {
    width: 18px;
    cursor: pointer;
    float: right;
    margin-top: 8px;
    margin-right: 4px;
  }

  .leftImage {
    float: left;
    margin-left: 0px;
    margin-right: 4px;
    width: 12px;
    margin-top: 10px;
  }

  .leftCommandsContainer {
    position: absolute;
    top: 0;
    left: 0;
  }

  .rightCommandsContainer {
    position: absolute;
    right: 0;
    top: 0;
  }
</style>
