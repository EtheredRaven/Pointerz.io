import { writable, get } from "svelte/store";

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

Client.svelte.updateLoadedVoteCircuits = function (voteCircuits) {
  if (!voteCircuits) {
    return;
  }

  const currentUserModel = get(userModel);
  if (!currentUserModel) {
    return;
  }

  const sortedCircuits = voteCircuits.sort((a, b) => {
    let upvoteDiff = b.upvotes - a.upvotes;
    return upvoteDiff == 0 ? b.creationDate - a.creationDate : upvoteDiff;
  });

  const updatedCircuits = sortedCircuits.map((voteCircuit) => ({
    ...voteCircuit,
    isUpvotedByUser:
      currentUserModel.circuitVotes.findIndex(
        (vote) => vote.toString() == voteCircuit._id.toString()
      ) >= 0,
  }));

  loadedVoteCircuits.set(updatedCircuits);
};

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
