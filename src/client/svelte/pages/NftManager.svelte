<script>
  import { fly, fade, slide } from "svelte/transition";
  import { Client, infoError, infoInfo } from "../misc/store";
  import AppLayout from "./AppLayout.svelte";
  import Cell from "../components/ui/Cell.svelte";
  import SelectionGrid from "../components/ui/SelectionGrid.svelte";
  import PointerzButton from "../components/ui/PointerzButton.svelte";
  import PointerzInput from "../components/ui/PointerzInput.svelte";
  import PointerzModal from "../components/ui/PointerzModal.svelte";
  import PointerzConfirm from "../components/ui/PointerzConfirm.svelte";
  import ParametersButtons from "../components/ui/ParametersButtons.svelte";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";
  import { onMount } from "svelte";

  let nfts = [];
  let selectedNftId = null;
  let openCreateNftModal = false;

  // NFT Categories and Rarities - update to match Constants.js
  const nftCategories = ["Body", "Wheel", "Flame"];

  // Define rarities as objects with id (number) and name
  const nftRarities = [
    { id: 5, name: "Common" },
    { id: 4, name: "Rare" },
    { id: 3, name: "Epic" },
    { id: 2, name: "Legendary" },
    { id: 1, name: "Unique" },
  ];

  // Form data - initialize rarity as a number
  let newNftForm = {
    nftName: "",
    nftCategory: nftCategories[0],
    nftRarity: 4, // Common as default value (numeric)
    nftMask: false,
    nftRawMetadata: "{}",
    copiesCount: 1,
  };

  // Load NFTs on page load
  onMount(() => {
    loadNfts();
  });

  function loadNfts() {
    Client.socket.getNfts();
  }

  function formatNftStats(nft) {
    return {
      category: {
        icon: `assets/images/menu/${nft.nftCategory?.toLowerCase() || "generic"}.png`,
        text: nft.nftCategory,
      },
      rarity: {
        icon: `assets/images/nfts/${Client.race.Constants.nftRarityInfo[nft.nftRarity]?.name.toLowerCase() || "common"}.png`,
        text:
          Client.race.Constants.nftRarityInfo[nft.nftRarity]?.name || "Common",
      },
      reference: nft.nftReference
        ? {
            icon: "assets/images/menu/link.png",
            text: `Ref: ${nft.nftReference}`,
          }
        : null,
    };
  }

  function createNewNft() {
    try {
      const metadata = JSON.parse(newNftForm.nftRawMetadata);
      // Re-stringify to ensure valid JSON
      const validMetadata = JSON.stringify(metadata);

      Client.socket.createNewNfts({
        ...newNftForm,
        nftRawMetadata: validMetadata,
      });

      openCreateNftModal = false;
      resetForm();
    } catch (e) {
      $infoError = `Invalid JSON metadata: ${e.message}`;
    }
  }

  function resetForm() {
    newNftForm = {
      nftName: "",
      nftCategory: nftCategories[0],
      nftRarity: 4, // Reset to Common (numeric)
      nftMask: false,
      nftRawMetadata: "{}",
      copiesCount: 1,
    };
  }

  function selectNft(id) {
    selectedNftId = id;
  }

  function deleteNft() {
    if (!selectedNftId) {
      $infoError = "No NFT selected";
      return;
    }

    Client.socket.deleteNft(selectedNftId);
  }

  // Socket handlers
  Client.svelte.updateNfts = function (data) {
    if (data.error) {
      $infoError = data.error;
      return;
    }

    nfts = data.nfts;
    $infoInfo = "NFTs loaded successfully";
  };

  Client.svelte.nftCreated = function (data) {
    if (data.error) {
      $infoError = data.error;
      return;
    }

    loadNfts();
    $infoInfo = `Created ${data.count} NFT(s) successfully`;
  };

  Client.svelte.nftDeleted = function (data) {
    if (data.error) {
      $infoError = data.error;
      return;
    }

    loadNfts();
    selectedNftId = null;
    $infoInfo = "NFT deleted successfully";
  };
</script>

<AppLayout>
  <OfflineRedirect />
  <div
    class="container"
    in:fly={{ delay: 400, duration: 400 }}
    out:fade={{ duration: 400 }}>
    <ParametersButtons backHref="/privatemenu" />

    <div class="content-grid">
      <div class="nfts-column">
        <SelectionGrid
          items={nfts.map((nft) => ({
            ...nft,
            name: nft.nftName,
            stats: formatNftStats(nft),
          }))}
          bind:selectedId={selectedNftId}
          title="NFT Database"
          titleColor="darkBlue"
          titleIcon="assets/images/menu/nft.png"
          getItemId={(item) => item.nftId}
          on:select={({ detail }) => selectNft(detail.id)} />
      </div>

      <div class="actions-column">
        <Cell
          title="NFT Actions"
          color="darkBlue"
          titleImagePath="assets/images/menu/gear.png">
          <div class="actions-container">
            {#if selectedNftId}
              <PointerzConfirm
                let:confirm={confirmThis}
                confirmTitle="Delete"
                cancelTitle="Cancel">
                <PointerzButton
                  buttonColor="darkRed"
                  important
                  noMargins
                  imagePath="assets/images/menu/delete.png"
                  noSound
                  on:click={() => confirmThis(deleteNft)}>
                  Delete NFT
                </PointerzButton>
                <span slot="title">Delete this NFT?</span>
                <span slot="description">
                  This action cannot be undone. References to this NFT will
                  break.
                </span>
              </PointerzConfirm>
            {/if}

            <PointerzButton
              buttonColor="darkGreen"
              important
              noMargins
              imagePath="assets/images/menu/add.png"
              on:click={() => (openCreateNftModal = true)}>
              Create New NFT
            </PointerzButton>
          </div>
        </Cell>
      </div>
    </div>
  </div>

  <!-- NFT Creation Modal -->
  <!-- NFT Creation Modal -->
  <PointerzModal
    bind:showDialog={openCreateNftModal}
    color="darkGreen"
    confirmTitle="Create NFT"
    confirmFunction={createNewNft}
    canCancel={true}>
    <span slot="title">Create New NFT</span>
    <div slot="description" class="modal-content">
      <div class="form-container">
        <div class="form-row">
          <label>Name</label>
          <PointerzInput
            type="text"
            bind:value={newNftForm.nftName}
            placeholder="NFT Name" />
        </div>

        <div class="form-row">
          <label>Category</label>
          <select bind:value={newNftForm.nftCategory} class="form-select">
            {#each nftCategories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>

        <div class="form-row">
          <label>Rarity</label>
          <select bind:value={newNftForm.nftRarity} class="form-select">
            {#each nftRarities as rarity}
              <option value={rarity.id}>{rarity.name}</option>
            {/each}
          </select>
        </div>

        <div class="form-row checkbox-row">
          <label>Mask</label>
          <input
            type="checkbox"
            bind:checked={newNftForm.nftMask}
            class="checkbox-input" />
        </div>

        <div class="form-row">
          <label>Metadata (JSON)</label>
          <PointerzInput type="text" bind:value={newNftForm.nftRawMetadata} />
        </div>

        <div class="form-row">
          <label>Number of copies</label>
          <PointerzInput
            type="text"
            bind:value={newNftForm.copiesCount}
            placeholder="1" />
        </div>

        <!-- Add manual create button if needed -->
        <div class="form-actions">
          <PointerzButton
            buttonColor="darkGreen"
            important
            on:click={createNewNft}>
            Create NFT
          </PointerzButton>
        </div>
      </div>
    </div>
  </PointerzModal>
</AppLayout>

<style>
  .container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    margin-top: 2rem;
  }

  .actions-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: var(--container-blocks-bg);
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 12px 0;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .checkbox-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .form-select {
    background: var(--container-blocks-bg);
    color: var(--almost-white-color);
    padding: 10px;
    border: 2px solid var(--dark-grey-color);
    border-radius: 8px;
    font-family: "Nunito";
    font-size: 16px;
  }

  label {
    color: var(--almost-white-color);
    font-family: "Nunito Bold";
    font-size: 16px;
  }

  @media (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  .modal-content {
    background: var(--over-container-blocks-bg);
    padding: 16px;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 12px 0;
    width: 100%;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .checkbox-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .form-select {
    background: var(--container-blocks-bg);
    color: var(--almost-white-color);
    padding: 10px;
    border: 2px solid var(--dark-grey-color);
    border-radius: 8px;
    font-family: "Nunito";
    font-size: 16px;
  }

  .checkbox-input {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  label {
    color: var(--almost-white-color);
    font-family: "Nunito Bold";
    font-size: 16px;
  }

  @media (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  .form-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
</style>
