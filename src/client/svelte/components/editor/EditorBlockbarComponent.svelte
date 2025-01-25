<script>
  import { scale } from "svelte/transition";
  import { css } from "../../misc/css";
  import { Client, editorMenuLastClick } from "../../misc/store";

  const menuHeightPerDepth = 64;
  let imagesPath = "../../../assets/images/blockbar/";
  export let menuDepth = 0;
  export let blocksMenu;
  export let directParent = "";

  // TODO : le menu ne marche pas pour plus d'un niveau -> il faut rajouter plusieurs conditions = vérifier si l'élément cliqué est un des enfants (récursif) + vérifier si c'est un frère ou soeur (= même parent)
  $: hidden = () => {
    let show =
      menuDepth == 0 ||
      $editorMenuLastClick.name == directParent ||
      $editorMenuLastClick.name == blocksMenu.name ||
      $editorMenuLastClick.directParent == directParent;
    return !show;
  };

  let isArrayOfComponents = Array.isArray(blocksMenu);

  let formatBlockbarName = function (name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  let onComponentClick = function () {
    Client.phaser.playSound("menuSelection");
    $editorMenuLastClick.name == blocksMenu.name
      ? Client.svelte.resetSelectedBlockType()
      : ($editorMenuLastClick = {
          name: blocksMenu.name,
          directParent: directParent,
        });

    if (!blocksMenu.subMenu) {
      Client.phaser.editor.deletePlacedBlock();
      Client.phaser.editor.placeNewBlock(
        blocksMenu.name,
        directParent == "DRAW"
      );
    }
  };
</script>

{#if isArrayOfComponents}
  <div
    class="blocksContainer"
    style={"bottom:" +
      (menuHeightPerDepth + css.default.margin) * menuDepth +
      "px;"}>
    {#each blocksMenu as block}
      <svelte:self blocksMenu={block} {menuDepth} {directParent} />
    {/each}
  </div>
{:else if !hidden()}
  <div
    transition:scale
    class={"blockComponent " +
      ($editorMenuLastClick.name == blocksMenu.name ? "selectedBlock" : "")}
    on:click|stopPropagation={onComponentClick}>
    <div class="blockbarImageContainer">
      <img
        alt="blockbarImage"
        src={imagesPath + blocksMenu.name + ".png"}
        class="blockbarImage" />
    </div>
    <div class="blockbarLabel">
      {formatBlockbarName(blocksMenu.name)}
    </div>
    {#if blocksMenu.subMenu}
      <svelte:self
        blocksMenu={blocksMenu.subMenu}
        directParent={blocksMenu.name}
        menuDepth={menuDepth + 1} />
    {/if}
  </div>
{/if}

<style>
  .blocksContainer {
    width: inherit;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 8px;
    position: absolute;
    justify-content: center;
  }

  .blockComponent {
    display: inline-block;
    width: 64px;
    height: 64px;
    border-radius: 8px;
    background-color: var(--over-container-blocks-bg);
    box-sizing: border-box;
    border: 1px solid var(--over-container-blocks-bg);
  }

  .blockbarImageContainer {
    text-align: center;
  }

  .blockbarImage {
    width: 40px;
    margin-top: 8px;
  }

  .blockbarLabel {
    color: var(--almost-white-color);
    font-variant: small-caps;
    bottom: 0px;
    position: relative;
    text-align: center;
    font-size: 13px;
  }

  .selectedBlock {
    border: 1px solid yellow;
  }
</style>
