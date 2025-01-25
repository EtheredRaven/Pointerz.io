import CampaignMenu from "../pages/CampaignMenu.svelte";
import PrivateMenu from "../pages/PrivateMenu.svelte";
import PublicMenu from "../pages/PublicMenu.svelte";
import RaceOverlay from "../pages/RaceOverlay.svelte";
import EditorMenu from "../pages/EditorMenu.svelte";
import EditorOverlay from "../pages/EditorOverlay.svelte";
import CircuitVote from "../pages/CircuitVote.svelte";
import { push } from "svelte-spa-router";

const routes = {
  "/": PublicMenu,
  "/privatemenu": PrivateMenu,
  "/campaignmenu": CampaignMenu,
  "/race": RaceOverlay,
  "/editormenu": EditorMenu,
  "/editor": EditorOverlay,
  "/circuitvote": CircuitVote,
};

function playTheRightSoundtrack(route) {
  // Play the right soundtrack for the route
  if (
    route == "/privatemenu" ||
    route == "/campaignmenu" ||
    route == "/editormenu" ||
    route == "/circuitvote"
  ) {
    Client.phaser.playMainSoundtrack();
    Client.phaser.stopEngineSound();
    Client.phaser.stopSpaceshipThrustSound();
  } else if (route == "/race" || route == "/editor") {
    Client.phaser.playRandomSoundtrack();
    Client.phaser.stopEngineSound();
    Client.phaser.stopSpaceshipThrustSound();
  }
}

function pushRoute(route) {
  playTheRightSoundtrack(route);
  push(route);
}

// The soundtrack management should also work if the user navigates back using the browser's back button
window.addEventListener("popstate", () => {
  // The new route is everything after the # in the URL, and / if there is no #
  let newRoute = location.hash.slice(1) || "/";
  playTheRightSoundtrack(newRoute);
});

export { routes, pushRoute };
