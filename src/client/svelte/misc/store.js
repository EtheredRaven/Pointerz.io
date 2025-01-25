import { writable } from "svelte/store";

var Client = window.Client;
var infoError = writable(false);
var infoInfo = writable(false);

var loadedCircuits = writable([]);
var loadedEditorCircuits = writable([]);
var loadedVoteCircuits = writable([]);
var userModel = writable(null);
var loggedIn = writable(false);

var editorSelectedBlock = writable(null);

const playerNameMaxChar = 19;
var playerMail = writable("");
var playerPassword = writable("");
let storedName = localStorage.getItem("pointerz_username");
var playerName = writable(storedName ? storedName : "");

var passedData = writable({});

var editorMenuLastClick = writable({ name: "" });

export { playerNameMaxChar };
export { playerMail };
export { playerPassword };
export { playerName };
export { infoError };
export { infoInfo };
export { loadedCircuits };
export { userModel };
export { Client };
export { loggedIn };
export { passedData };
export { loadedEditorCircuits };
export { editorSelectedBlock };
export { editorMenuLastClick };
export { loadedVoteCircuits };

export default {
  playerNameMaxChar,
  playerMail,
  playerPassword,
  playerName,
  infoError,
  infoInfo,
  loadedCircuits,
  userModel,
  Client,
  loggedIn,
  passedData,
  loadedEditorCircuits,
  editorSelectedBlock,
  editorMenuLastClick,
  loadedVoteCircuits,
};
