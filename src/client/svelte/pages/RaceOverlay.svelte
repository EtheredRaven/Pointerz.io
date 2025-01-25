<script>
  // The global race overlay encapsulating all the user in-race user interface
  import { fade } from "svelte/transition";
  import { Shadow } from "svelte-loading-spinners";
  import { Client } from "../misc/store";

  import CheckpointTime from "../components/race/CheckpointTime.svelte";
  import LapCounter from "../components/race/LapCounter.svelte";
  import LiveRanking from "../components/race/LiveRanking.svelte";
  import RaceCounter from "../components/race/RaceCounter.svelte";
  import RaceTime from "../components/race/RaceTime.svelte";
  import EndraceMenu from "../components/race/EndraceMenu.svelte";
  import OfflineRedirect from "../components/ui/OfflineRedirect.svelte";

  let loadingRace = true; // The loading circuit animation

  // Circuit loading animation
  Client.svelte.setRaceLoading = function (val) {
    loadingRace = val;
  };
</script>

<OfflineRedirect />
<LiveRanking />
<RaceCounter />
<RaceTime />
<CheckpointTime />
<LapCounter />
<EndraceMenu />
{#if loadingRace}
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
