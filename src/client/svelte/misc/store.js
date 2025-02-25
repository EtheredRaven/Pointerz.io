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

Client.svelte.updateLoadedEditorCircuits = function (editorCircuits) {
  if (!editorCircuits) {
    return;
  }

  const sortedCircuits = editorCircuits.sort(
    (a, b) => b.creationDate - a.creationDate
  );

  loadedEditorCircuits.set(sortedCircuits);
};

// Update the display according to the new records, triggered when logged in and when asked for updating records
Client.svelte.updateLoadedCampaignCircuits = function (circuits, records) {
  if (!records || !circuits) {
    return;
  }

  const currentUserModel = get(userModel);
  if (!currentUserModel) {
    return;
  }

  const updatedCircuits = circuits.map((circuit, i) => {
    const recordForCircuit =
      i < records.length && records[i].run ? records[i] : undefined;
    const circuitCopy = { ...circuit };

    if (recordForCircuit) {
      // If there is a record by the user
      circuitCopy.userRecord = recordForCircuit;

      // If there is no record by this user in the five best times, add it to the table
      if (
        !circuitCopy.runs.some((run) => run._userId === currentUserModel._id)
      ) {
        recordForCircuit.run.formattedRanking = recordForCircuit.ranking + 1;
        circuitCopy.runs = [...circuitCopy.runs, recordForCircuit.run];
      }
    }

    if (!circuitCopy.rankingFormatted) {
      circuitCopy.rankingFormatted = true;
      circuitCopy.runs = circuitCopy.runs.map((globalRecord, j) => ({
        ...globalRecord,
        highlighted: globalRecord._userId === currentUserModel._id,
        formattedRanking: `${j + 1}<sup>${Client.getSupFromNumber(
          j + 1
        )}</sup>`,
        formattedRunTime: Client.race.Functions.msToTime(
          globalRecord.runTime,
          3
        ),
      }));
    }

    return circuitCopy;
  });

  loadedCircuits.set(updatedCircuits);
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
  loadedEditorCircuits,
  editorSelectedBlock,
  editorMenuLastClick,
  loadedVoteCircuits,
};
