const admin = require("firebase-admin");

const createGame = (gameName, userId) =>
  new Promise((res, rej) =>
    generateGameId()
      .then(gameId => createPriviteGame(userId, gameId))
      .then(gameId => createPublicGame(gameName, gameId))
      .then(gameId => createWaitingGame(gameName, gameId))
      .then(gameId => res({ gameId }))
      .catch(err => rej(err))
  );
const joinGame = (gameId, userId) =>
  new Promise((res, rej) =>
    addPlayerToGame(gameId, userId)
      .then(gameId => deleteWaitingGame(gameId))
      .then(gameId => res({ gameId }))
      .catch(err => rej(err))
  );
const generateGameId = () =>
  Promise.resolve(
    admin
      .database()
      .ref()
      .child("keys")
      .push().key
  );

const addPlayerToGame = (gameId, userId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/games/${gameId}/private/players`)
      .update({ playerTwo: userId })
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

const createPriviteGame = (userId, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref(`/games/${gameId}/private`)
      .update({ players: { playerOne: userId }, nexPlayer: userId })
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

const getInitialState = () => ({
  playerOne: { position: 0, reminingPawns: 6 },
  playerTwo: { position: 0, reminingPawns: 6 },
  PawnsPositions: [],
  Winner: 0
});
const setGameState = (gameState, gameId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref($`/games/${gameId}/public`)
      .update({ gameState })
      .then(() => res(gameState))
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
  return Promise.resolve();
};

module.exports = {
  createGame,
  isValidMove,
  getCurrentGameState,
  setGameState,
  joinGame
};
