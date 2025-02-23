<script>
  import { createEventDispatcher } from "svelte";
  import Cell from "./Cell.svelte";

  const dispatch = createEventDispatcher();

  export let items = [];
  export let selectedId = null;
  export let title = "";
  export let titleColor = "orange";
  export let titleIcon = null;
  export let getItemId = (item) => item._id;
  export let showAddButton = false;
  export let addButtonAction = () => {};

  // Customization props
  export let itemTemplate = null; // Optional slot for custom item content
  export let gridColumns = "repeat(auto-fill, minmax(280px, 1fr))";
  export let showDefaultStats = true;

  function selectItem(item) {
    const id = getItemId(item);
    if (id !== selectedId) {
      selectedId = id;
      dispatch("select", { item, id });
    }
  }
</script>

<Cell {title} color={titleColor} titleImagePath={titleIcon}>
  <div class="selection-grid" style="grid-template-columns: {gridColumns}">
    {#each items as item (getItemId(item))}
      <div
        class="item-card {selectedId === getItemId(item) ? 'selected' : ''}"
        on:click={() => selectItem(item)}
        on:keydown={(e) => e.key === "Enter" && selectItem(item)}>
        {#if itemTemplate}
          <slot name="item" {item} />
        {:else}
          <div class="item-content">
            <div class="item-main">
              {#if item.number !== undefined}
                <div class="item-number">{item.number}</div>
              {/if}
              <div class="item-info">
                <div class="item-name">
                  {item.name || item.nftName || `Item ${getItemId(item)}`}
                </div>
                {#if showDefaultStats && item.stats}
                  <div class="item-stats">
                    {#each Object.entries(item.stats) as [key, value]}
                      {#if value?.text}
                        <span class="stat">
                          {#if value?.svg}
                            {@html value.svg}
                          {:else if value?.icon}
                            <img src={value.icon} alt={key} class="stat-icon" />
                          {/if}
                          {value?.text || value || ""}
                        </span>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
            {#if item.badge}
              <div
                class="badge"
                style="color: var({item.badge.color || '--orange-color'})">
                {item.badge.text}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}

    {#if showAddButton}
      <div class="item-card add-button" on:click={addButtonAction}>
        <div class="add-content">
          <img
            class="add-icon"
            src="assets/images/blockProperties/addComponent.png"
            alt="Add" />
        </div>
      </div>
    {/if}
  </div>
</Cell>

<style>
  .selection-grid {
    display: grid;
    gap: 12px;
    background: var(--container-blocks-bg);
    padding: 12px;
    border-radius: 8px;
  }

  .item-card {
    background: var(--over-container-blocks-bg);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .item-card:hover {
    background: var(--over-container-blocks-selected-bg);
    transform: translateY(-2px);
  }

  .item-card.selected {
    border-color: var(--orange-color);
    background: var(--over-container-blocks-selected-bg);
  }

  .item-content {
    display: flex;
    flex-direction: column;
  }

  .item-main {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .item-number {
    font-family: "virgo";
    font-size: 32px;
    color: var(--orange-color);
    min-width: 40px;
    text-align: center;
  }

  .item-name {
    font-family: "Nunito Bold";
    font-size: 18px;
    margin-bottom: 0.5rem;
    text-align: left;
    color: var(--almost-white-color);
  }

  .item-stats {
    display: flex;
    gap: 1rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 14px;
    color: var(--light-grey-color);
    font-weight: bold;
  }

  .stat-icon {
    width: 16px;
    height: 16px;
  }

  .badge {
    font-family: "Nunito";
    font-size: 14px;
    padding: 4px 12px;
    border-radius: 12px;
    background: var(--container-blocks-bg);
    align-self: flex-start;
  }

  .add-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--light-grey-color);
    background: transparent;
    height: 95px;
    box-sizing: border-box;
  }

  .add-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--light-grey-color);
    font-family: "Nunito";
  }

  .add-icon {
    width: 32px;
    height: 32px;
    opacity: 0.7;
  }
</style>
