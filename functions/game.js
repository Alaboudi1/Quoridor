import { Promise } from "firebase";

const admin = require("firebase-admin");

const createGame = (gameName, playerId) =>
  new Promise((res, rej) =>
    isCurrentlyPlaying(playerId)
      .then(generateGameId)
      .then(gameId => createPriviteGame(playerId, gameId))
      .then(gameId => createPublicGame(gameName, gameId))
      .then(gameId => createWaitingGame(gameName, gameId))
      .then(gameId => setCurrentlyPlaying(playerId, gameId))
      .then(gameId => res({ gameId }))
      .catch(err => rej(err))
  );
const joinGame = (gameId, playerId) =>
  new Promise((res, rej) =>
    isCurrentlyPlaying(playerId)
      .then(gameId => canJoinGame(gameId))
      .then(gameId => addPlayerToGame(gameId, playerId))
      .then(gameId => setCurrentlyPlaying(playerId, gameId))
      .then(gameId => deleteWaitingGame(gameId))
      .then(gameId => res({ gameId }))
      .catch(err => rej(err))
  );
const setMove = (playerId, gameId, futureGameState) =>
  new Promise((res, rej) =>
    getCurrentGameState(gameId, userId)
      .then(currentGameState => isValidMove(currentGameState, futureGameState))
      .then(futureGameState => isWinnerMove(futureGameState, gameId, playerId))
      .then(() => setNextPlayer(gameId, playerId))
      .then(futureGameState => updateGameState(futureGameState, gameId))
      .then(GameState => res(GameState))
      .catch(err => rej({ err }))
  );
const generateGameId = () =>
  Promise.resolve(
    admin
      .database()
      .ref()
      .child("keys")
      .push().key
  );
const canJoinGame = gameId =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/waitingGames/${gameId}`)
      .once("value")
      .then(
        data =>
          data.val() ? res(gameId) : rej({ err: "Game does not exist!" })
      )
  );

const addPlayerToGame = (gameId, playerId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/games/${gameId}/private/players`)
      .update({ playerTwo: playerId })
      .then(() => res(gameId))
      .catch(err => rej(err))
  );
const deleteWaitingGame = gameId =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/waitingGames/${gameId}`)
      .remove()
      .then(() => res(gameId))
      .catch(err => rej(err))
  );

const createPriviteGame = (playerId, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/games/${gameId}/private`)
      .update({ players: { playerOne: playerId }, nexPlayer: playerId })
      .then(() => res(gameId))
      .catch(err => rej(err))
  );

const createPublicGame = (gameName, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/games/${gameId}/public`)
      .update({
        gameStatus: getInitialState(),
        messages: "waiting for a player to join...",
        gameName
      })
      .then(() => res(gameId))
      .catch(err => rej(err))
  );

const createWaitingGame = (gameName, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/waitingGames/${gameId}`)
      .update({ gameName })
      .then(() => res(gameId))
      .catch(err => rej(err))
  );
//not yet completed
const isWinnerMove = (futureGameState, gameId, playerId) => {
  const winner =
    WinningPosition.find(futureGameState.playerOne.position) ||
    WinningPosition.find(futureGameState.playerOne.position)
      ? playerId
      : 0;

  return new Promise((res, rej) =>
    admin
      .database()
      .ref(`/waitingGames/${gameId}`)
      .update({ winner })
      .then(() => res(gameId))
      .catch(err => rej(err))
  );
};
const getInitialState = () => ({
  playerOne: { position: 0, reminingPawns: 6 },
  playerTwo: { position: 0, reminingPawns: 6 },
  PawnsPositions: [],
  Winner: 0
});
const setNextPlayer = (gameId, playerId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/games/${gameId}/private`)
      .update({ nextPlayer: playerId })
      .then(() => res())
      .catch(err => rej(err))
  );
const updateGameState = (gameState, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/games/${gameId}/public`)
      .update({ gameState })
      .then(() => res(gameState))
      .catch(err => rej(err))
  );
const getCurrentGameState = gameId =>
  Promise.resolve(
    admin
      .database()
      .ref(`/games/${gameId}/public/currentSate`)
      .once("value")
      .then(data => res(data.val().state))
  );
const isValidMove = (oldMove, newMove) => {
  return Promise.resolve();
};

const createUserProfile = ({ data }) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/playersProfiles/${data.uid}`)
      .update({ numberOfGamesPlayed: 0, won: 0, lost: 0, currentlyPlaying: 0 })
      .catch(err => rej({ err }))
  );
const getUserProfile = playerId =>
  Promise.resolve(
    admin
      .database()
      .ref(`/playersProfiles/${playerId}`)
      .once("value")
      .then(data => res(data.val()))
  );
const isCurrentlyPlaying = playerId =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/playersProfiles/${playerId}`)
      .once("value")
      .then(
        data =>
          data.val().currentlyPlaying != 0
            ? rej("You already playing another game!")
            : res()
      )
      .catch(err => rej(err))
  );
const setCurrentlyPlaying = (playerId, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/playersProfiles/${playerId}`)
      .update({ currentlyPlaying: gameId })
      .then(() => res(gameId))
      .catch(err => rej(err))
  );
const updatePlayerProfile = (playerId, update) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/playersProfiles/${playerId}`)
      .update({
        numberOfGamesPlayed: updaye.numberOfGamesPlayed,
        won: update.numberOfGamesPlayed,
        lost: update.lost,
        currentlyPlaying: update.currentlyPlaying
      })
      .then(() => res(playerId))
      .catch(err => rej({ err }))
  );
module.exports = {
  createGame,
  joinGame,
  createUserProfile,
  setMove
};
