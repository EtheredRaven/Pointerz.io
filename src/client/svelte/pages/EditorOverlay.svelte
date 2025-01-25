<script>
  // The global race overlay encapsulating all the user in-race user interface
  import { fade } from "svelte/transition";
  import { Shadow } from "svelte-loading-spinners";
  import { Client } from "../misc/store";

  import PanelContainer from "../components/editor/PanelContainer.svelte";
  import EditorBlockbar from "../components/editor/EditorBlockbar.svelte";
  import EditorCircuitActionsMenu from "../components/editor/EditorCircuitActionsMenu.svelte";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";

  let loadingEditor = true; // The loading circuit animation

  // Circuit loading animation
  Client.svelte.setEditorLoading = function (val) {
    loadingEditor = val;
  };
</script>

<OfflineRedirect />
<PanelContainer />
<EditorCircuitActionsMenu />
<EditorBlockbar />
{#if loadingEditor}
  <div out:fade={{ duration: 400 }} class="background">
    <div class="centerer">
      <div style="display:inline-block">
        <Shadow size="80" color="var(--red-color)" unit="px" />
      </div>
    </div>
  </div>
{/if}

<style>
  .background {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: var(--almost-black-color);
  }

  .centerer {
    margin: 0;
    position: absolute;
    top: calc(50% - 40px);
    width: 100%;
    text-align: center;
  }
</style>
