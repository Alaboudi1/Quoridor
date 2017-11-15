const functions = require("firebase-functions");
const express = require("express");

const { isAuthenticated, isAuthorized } = require("./verifier");
const {
  setGameState,
  createGame,
  joinGame,
  isValidMove,
  getCurrentGameState
} = require("./game");

const app = express();
// app2.use(cors({ origin: true }));

app.put("/setMove", (req, res) => {
  const params = req.body;
  isAuthenticated(params.token)
    .then(user => isAuthorized(params.gameId, user.uid))
    .then(userId => getCurrentGameState(params.gameId, userId))
    .then(currentGameState => isValidMove(currentGameState, params.move))
    .then(futureGameState => setGameState(futureGameState, params.gameId))
    .catch(err => res.send({ err }));
});

app.post("/createGame", (req, res) => {
  const params = req.body;
  isAuthenticated(params.token)
    .then(user => createGame(params.gameName, user.uid))
    .then(gameId => res.send(gameId))
    .catch(err => res.send({ err }));
});

app.put("/joinGame", (req, res) => {
  const params = req.body;
  isAuthenticated(params.token)
    .then(user => joinGame(params.gameId, user.uid))
    .then(gameId => res.send(gameId))
    .catch(err => res.send(err));
});
app.all("**", (req, res) => {
  res.sendStatus(404);
});

exports.api = functions.https.onRequest(app);
