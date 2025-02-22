<script>
  // Main menu with the circuit list when logged in
  import { fly, fade, slide } from "svelte/transition";
  import AppLayout from "./AppLayout.svelte";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";
  import ParametersButtons from "../components/ui/ParametersButtons.svelte";
  import SelectionGrid from "../components/ui/SelectionGrid.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import { Client, userModel } from "../misc/store";
  import { onMount, onDestroy } from "svelte";

  let environments = Client.race.Constants.environments;

  let isModifyingSpaceship = false;
  $: groupedNFTs = (() => {
    const groups = {};
    const userNfts = $userModel?.nfts || [];

    // Initialize all categories with defaults
    Object.entries(Client.race.Constants.defaultNFTs).forEach(
      ([category, defaultNft]) => {
        groups[category] = [
          {
            ...defaultNft,
            nftSelected: !userNfts.some(
              (nft) => nft.nftCategory === category && nft.nftSelected
            ),
          },
        ];
      }
    );

    // Add user NFTs
    userNfts.forEach((nft) => {
      if (!groups[nft.nftCategory]) {
        groups[nft.nftCategory] = [];
      }
      groups[nft.nftCategory].push(nft);
    });

    return groups;
  })();

  function selectNFT(item) {
    Client.phaser.playSound("buttonSelection");

    if (item.nftCategory === "Wheels") {
      setVisualiserEnvironment(environments.ROAD, false);
    } else if (item.nftCategory === "Flame") {
      setVisualiserEnvironment(environments.SPACE, false);
    }

    // Create new reference to trigger reactivity
    groupedNFTs = Object.fromEntries(
      Object.entries(groupedNFTs).map(([category, items]) => [
        category,
        items.map((nft) => ({
          ...nft,
          nftSelected:
            nft.nftCategory === item.nftCategory
              ? nft === item
              : nft.nftSelected,
        })),
      ])
    );

    // Send the ids of the selected NFTs to the server
    let selectedNFTs = Object.values(groupedNFTs)
      .flat()
      .filter((nft) => nft.nftSelected);

    Client.socket.updateNFTSelection(selectedNFTs.map((nft) => nft.nftId));
    Client.phaser.updateVisualiserNFTs(selectedNFTs);
  }

  function goToCircuitEditor() {
    Client.pushRoute("/editormenu");
  }

  function goToCampaignMenu() {
    Client.pushRoute("/campaignmenu");
  }

  function goToNextCircuitVote() {
    Client.pushRoute("/circuitvote");
  }

  function goToSpaceshipModification() {
    Client.phaser.playSound("buttonClick");
    isModifyingSpaceship = true;
  }

  function goBack() {
    isModifyingSpaceship = false;
  }

  function setVisualiserEnvironment(newEnvironment, playSound = true) {
    playSound && Client.phaser.playSound("transition");
    visualiserEnvironment = newEnvironment;
    Client.phaser.setVisualiserEnvironment(newEnvironment);
  }

  let visualiserEnvironment = environments.SPACE;
  onMount(() => {
    // Load the spaceship visualiser
    Client.phaser.initSpaceshipModificationCanvas(Client);
  });

  onDestroy(() => {
    // Destroy the spaceship visualiser
    Client.phaser.destroySpaceshipModificationCanvas();
  });
</script>

<AppLayout>
  <OfflineRedirect />
  <ParametersButtons {goBack} showBackButton={isModifyingSpaceship} />

  <div
    in:fly={{ delay: 400, duration: 400 }}
    out:fade={{ duration: 400 }}
    id="buttonsContainer"
    class="container">
    <div>
      {#if !isModifyingSpaceship}
        <div
          class="menu-column"
          in:fade={{ delay: 400, duration: 400 }}
          out:fade={{ duration: 400 }}>
          <PointerzButton
            buttonColor="darkBlue"
            important
            noMargins
            fullHeight
            animating
            on:click={goToCampaignMenu}>
            <div class="button-content">
              <span>Campaign</span>
              <img
                src="assets/images/menu/flag.png"
                alt="Flag"
                class="menu-icon" />
            </div>
          </PointerzButton>

          <PointerzButton
            buttonColor="darkBlue"
            important
            noMargins
            fullHeight
            animating
            on:click={goToNextCircuitVote}>
            <div class="button-content">
              <span>Next Circuit Vote</span>
              <img
                src="assets/images/menu/calendar.png"
                alt="Calendar"
                class="menu-icon" />
            </div>
          </PointerzButton>

          <PointerzButton
            buttonColor="darkBlue"
            important
            noMargins
            fullHeight
            animating
            on:click={goToCircuitEditor}>
            <div class="button-content">
              <span>Circuit Editor</span>
              <img
                src="assets/images/menu/draw.png"
                alt="Draw"
                class="menu-icon" />
            </div>
          </PointerzButton>
        </div>
      {:else}
        <div
          class="spaceship-elements-container"
          in:fade={{ delay: 400, duration: 400 }}
          out:fade={{ duration: 400 }}>
          {#each Object.entries(groupedNFTs) as [category, items]}
            <SelectionGrid
              items={items.map((nft) => ({
                nft: nft,
                nftId: nft.nftId,
                name: nft.nftName,
                badge: nft.nftRarity
                  ? {
                      text: Client.race.Constants.nftRarityInfo[nft.nftRarity]
                        .name,
                      color:
                        Client.race.Constants.nftRarityInfo[nft.nftRarity]
                          .color,
                    }
                  : null,
              }))}
              selectedId={items.find((nft) => nft.nftSelected)?.nftId ||
                items.find((nft) => nft.isDefault)?.nftId}
              title={category}
              titleColor="darkOrange"
              getItemId={(item) => item.nftId}
              showAddButton={true}
              addButtonAction={() =>
                window.open(
                  "https://kollection.app/collection/" +
                    Client.pointerzNFTsContractAddress,
                  "_blank"
                )}
              gridColumns="repeat(auto-fill, minmax(180px, 1fr))"
              on:select={({ detail }) => selectNFT(detail.item.nft)} />
          {/each}
        </div>
      {/if}
    </div>

    <div class="content-column">
      <div class="spaceship-viewer">
        <div
          class="canvas-container"
          style={{
            aspectRatio: Client.spaceshipVisualiserRatio,
            width: Client.spaceshipVisualiserWidth,
            height: Client.spaceshipVisualiserHeight,
          }}>
          <div id="spaceshipCanvas"></div>
          <div class="config-buttons">
            <div
              class={[
                visualiserEnvironment === environments.SPACE
                  ? "visualiser-button-selected"
                  : "",
                "visualiser-button",
              ].join(" ")}
              on:click={() => setVisualiserEnvironment(environments.SPACE)}>
              <svg
                width="64px"
                height="64px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M5.926 20.574a7.26 7.26 0 0 0 3.039 1.511c.107.035.179-.105.107-.175-2.395-2.285-1.079-4.758-.107-5.873.693-.796 1.68-2.107 1.608-3.865 0-.176.18-.317.322-.211 1.359.703 2.288 2.25 2.538 3.515.394-.386.537-.984.537-1.511 0-.176.214-.317.393-.176 1.287 1.16 3.503 5.097-.072 8.19-.071.071 0 .212.072.177a8.761 8.761 0 0 0 3.003-1.442c5.827-4.5 2.037-12.48-.43-15.116-.321-.317-.893-.106-.893.351-.036.95-.322 2.004-1.072 2.707-.572-2.39-2.478-5.105-5.195-6.441-.357-.176-.786.105-.75.492.07 3.27-2.063 5.352-3.922 8.059-1.645 2.425-2.717 6.89.822 9.808z"
                  fill="currentColor" /></svg>
            </div>
            <div
              class={[
                visualiserEnvironment === environments.ROAD
                  ? "visualiser-button-selected"
                  : "",
                "visualiser-button",
              ].join(" ")}
              on:click={() => setVisualiserEnvironment(environments.ROAD)}>
              <div>
                <svg
                  fill="currentColor"
                  width="64px"
                  height="64px"
                  viewBox="0 0 122.88 122.88"
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink">
                  <g>
                    <path
                      d="M61.44,21.74c10.96,0,20.89,4.44,28.07,11.63c7.18,7.18,11.63,17.11,11.63,28.07c0,10.96-4.44,20.89-11.63,28.07 c-7.18,7.18-17.11,11.63-28.07,11.63c-10.96,0-20.89-4.44-28.07-11.63c-7.18-7.18-11.63-17.11-11.63-28.07 c0-10.96,4.44-20.89,11.63-28.07C40.55,26.19,50.48,21.74,61.44,21.74L61.44,21.74z M61.44,0c16.97,0,32.33,6.88,43.44,18 c11.12,11.12,18,26.48,18,43.44c0,16.97-6.88,32.33-18,43.44c-11.12,11.12-26.48,18-43.44,18c-16.97,0-32.33-6.88-43.44-18 C6.88,93.77,0,78.41,0,61.44C0,44.47,6.88,29.11,18,18C29.11,6.88,44.47,0,61.44,0L61.44,0z M93.47,29.41 c-8.2-8.2-19.52-13.27-32.03-13.27c-12.51,0-23.83,5.07-32.03,13.27c-8.2,8.2-13.27,19.52-13.27,32.03 c0,12.51,5.07,23.83,13.27,32.03c8.2,8.2,19.52,13.27,32.03,13.27c12.51,0,23.83-5.07,32.03-13.27c8.2-8.2,13.27-19.52,13.27-32.03 C106.74,48.93,101.67,37.61,93.47,29.41L93.47,29.41z M65.45,56.77c-1.02-1.02-2.43-1.65-4.01-1.65c-1.57,0-2.99,0.63-4.01,1.65 l-0.01,0.01c-1.02,1.02-1.65,2.43-1.65,4.01c0,1.57,0.63,2.99,1.65,4.01l0.01,0.01c1.02,1.02,2.43,1.65,4.01,1.65 c1.57,0,2.99-0.63,4.01-1.65l0.01-0.01c1.02-1.02,1.65-2.44,1.65-4.01C67.1,59.21,66.47,57.8,65.45,56.77L65.45,56.77L65.45,56.77z M65.06,50.79c1.47,0.54,2.8,1.39,3.89,2.48l0,0l0,0c0.37,0.37,0.72,0.77,1.03,1.2l0.1-0.03l21.02-5.63 c-1.63-3.83-3.98-7.28-6.88-10.17c-5.03-5.03-11.72-8.41-19.17-9.24v21.12C65.07,50.61,65.07,50.7,65.06,50.79L65.06,50.79z M72.04,61.63c-0.14,1.73-0.69,3.35-1.57,4.76c0.05,0.06,0.09,0.13,0.13,0.2l12.07,19.13c0.54-0.47,1.06-0.96,1.57-1.47 c5.83-5.83,9.44-13.9,9.44-22.8c0-1.87-0.16-3.7-0.47-5.49L72.04,61.63L72.04,61.63z M64.57,70.95c-0.99,0.31-2.04,0.47-3.13,0.47 c-0.98,0-1.93-0.13-2.84-0.38L46.82,90.19c4.39,2.24,9.36,3.5,14.62,3.5c5.46,0,10.6-1.36,15.11-3.75L64.57,70.95L64.57,70.95z M52.57,66.64c-0.92-1.38-1.52-2.99-1.7-4.71l-0.01,0l-21.09-6.6c-0.38,1.98-0.58,4.02-0.58,6.11c0,8.9,3.61,16.97,9.44,22.8 c0.63,0.63,1.29,1.24,1.98,1.82l11.8-19.19C52.47,66.8,52.52,66.72,52.57,66.64L52.57,66.64z M52.72,54.72 c0.36-0.51,0.76-1,1.21-1.44l0,0l0,0c1.05-1.04,2.31-1.87,3.71-2.41c-0.01-0.11-0.02-0.23-0.02-0.34v-21.1 c-7.38,0.87-14,4.23-18.98,9.22c-2.75,2.75-5.01,6-6.63,9.6L52.72,54.72L52.72,54.72z" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
        {#if !isModifyingSpaceship}
          <div
            class="modifySpaceshipButtonContainer"
            in:slide={{ duration: 300 }}
            out:slide={{ duration: 1000 }}>
            <PointerzButton
              buttonColor="darkOrange"
              important
              imagePath="assets/images/menu/garage.png"
              fullHeight
              animating
              on:click={goToSpaceshipModification}>
              Modify your Pointerz
            </PointerzButton>
          </div>
        {/if}
      </div>
    </div>
  </div>
</AppLayout>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    height: 428px;
    max-height: 70vh;
    padding: 2rem;
    max-width: 1200px;
    margin: auto;
    align-items: start;
  }

  .menu-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    height: 100%;
    max-height: 600px; /* Add max height for buttons container */
  }

  .button-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 1rem;
    font-size: 30px;
    min-height: 110px;
  }

  .menu-icon {
    height: 80px;
    float: right;
    margin-right: 32px;
  }

  .content-column {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .spaceship-viewer {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .canvas-container {
    background: var(--container-blocks-bg);
    border-radius: 8px;
  }

  .config-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 28px;
    margin-top: 6px;
  }

  .modifySpaceshipButton {
    cursor: pointer;
    border-radius: 8px;
    margin-top: 24px;
    font-family: "virgo";
    font-size: 24px;
    color: var(--light-grey-color);
    background-color: var(--over-container-blocks-bg);
    padding: 10px 16px;
    transition: all 0.3s ease;
  }

  .modifySpaceshipButton:hover {
    color: var(--orange-color);
    background-color: var(--over-container-blocks-selected-bg);
  }

  .garage-icon {
    vertical-align: middle;
    margin-right: 2px;
  }

  .visualiser-button {
    cursor: pointer;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.3s ease;
    color: var(--grey-color);
  }

  .visualiser-button-selected {
    background-color: var(--over-container-blocks-selected-bg);
    color: var(--orange-color);
  }

  .spaceship-elements-container {
    padding: 0 16px;
    overflow-y: auto;
    max-height: calc(100vh - 405px);
    scrollbar-width: thin;
    scrollbar-color: var(--dark-grey-color) transparent;
    border-radius: 8px;
  }

  .category-section {
    margin-bottom: 2rem;
  }

  .category-title {
    color: hsl(0, 0%, 100%);
    font-family: "virgo";
    font-size: 24px;
    margin-bottom: 1rem;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .item-card {
    background: var(--over-container-blocks-bg);
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .item-card:hover {
    background: var(--over-container-blocks-selected-bg);
    transform: translateY(-2px);
  }

  .item-card.selected {
    border-color: var(--orange-color);
    background: var(--over-container-blocks-selected-bg);
  }

  .item-info {
    text-align: center;
  }

  .item-name {
    display: block;
    color: #fff;
    margin-bottom: 0.5rem;
    font-family: "virgo";
    font-size: 20px;
  }

  .item-rarity {
    display: block;
    font-size: 0.9rem;
    font-family: "Nunito";
  }

  .rarity-badge {
    align-self: flex-start;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-family: "Nunito";
    background: var(--container-blocks-bg);
  }

  .buy-nft-icon {
    width: 52px;
    vertical-align: middle;
  }

  @media (max-width: 1160px) {
    .container {
      grid-template-columns: 1fr;
      height: auto;
      max-width: 630px;
    }

    .menu-column {
      max-height: none;
    }

    .content-column {
      margin-top: 2rem;
    }
  }
</style>
