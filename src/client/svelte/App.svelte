<script>
  import Router from "svelte-spa-router";
  import { routes, pushRoute } from "./misc/routes";
  import { infoInfo, infoError, Client, userModel } from "./misc/store";
  import ClosableDislay from "./components/ui/ClosableDisplay.svelte";

  Client.svelte.showError = function (error) {
    $infoError = error;
  };

  Client.svelte.showInfo = function (info) {
    $infoInfo = info;
  };

  Client.svelte.updateUserModel = function (newUserModel) {
    $userModel = newUserModel;
    Client.phaser.updateVisualiserNFTs &&
      $userModel.nfts &&
      Client.phaser.updateVisualiserNFTs(
        $userModel.nfts.filter((nft) => nft.nftSelected)
      );
    let ret = Client.unlockCryptoAccount($userModel);
    if (ret && ret.retError) {
      $infoError = retError;
    }
  };

  Client.svelte.getUserModel = function () {
    return $userModel;
  };

  Client.pushRoute = pushRoute;
</script>

<Router {routes} />
<div class="notifications-container">
  <ClosableDislay
    color="red"
    sound="error"
    bind:displayedText={$infoError}
    imagePath="assets/images/connection/error.png" />
  <ClosableDislay
    color="green"
    sound="info"
    bind:displayedText={$infoInfo}
    imagePath="assets/images/connection/info.png" />
</div>

<style>
  .notifications-container {
    position: fixed;
    bottom: 16px;
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
    gap: 0px;
    z-index: 1 !important;
  }
</style>
