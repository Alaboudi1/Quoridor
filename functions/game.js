const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const createGame = () => {
  new Promise.all(createPriviteGame, createWaitingGame);
};
const joinGame = (gameId, userId) => {
  new Promise.all(addPlayerToGame(gameId, userId), deleteWaitingGame(gameId));
};
const addPlayerToGame = (gameId, userId) => {};
const deleteWaitingGame = gameId => {};
const createPriviteGame = () => {};
const createWaitingGame = () => {};
const getInitialState = () => ({
  playerOne: { position: null, reminingPawns: 6 },
  playerTwo: { position: null, reminingPawns: 6 },
  PawnsPositions: [],
  Winner: null
});
const setGameState = (gameState, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref($`/games/${gameId}/public`)
      .update({ gameState })
      .catch(err => rej(err))
  );
const getCurrentGameState = gameId =>
  Promise.resolve(
    admin
      .database()
      .ref($`/games/${gameId}/public/currentSate`)
      .once(data => res(data.val()["state"]))
  );
const isValidMove = (oldMove, newMove) => {
  return true;
};

module.exports = { createGame, isValidMove, getCurrentGameState, setGameState };
