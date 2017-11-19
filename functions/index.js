const functions = require("firebase-functions");
const express = require("express");

const { isAuthenticated, isAuthorized, getPlayerInfo } = require("./auth");
const {
  createGame,
  joinGame,
  setmove,
  createPlayerProfile,
  getLeaderBoard
} = require("./game");

const app = express();
// app2.use(cors({ origin: true }));

app.put("/setMove", (req, res) => {
  const params = req.body;
  isAuthenticated(params.token)
    .then(player => isAuthorized(params.gameId, player.uid))
    .then(playerId => setmove(playerId, params.gameId, params.move))
    .catch(err => res.send({ err }));
});

app.post("/createGame", (req, res) => {
  const params = req.body;
  isAuthenticated(params.token)
    .then(player => createGame(params.gameName, player.uid))
    .then(gameId => res.send(gameId))
    .catch(err => res.send({ err }));
});

app.put("/joinGame", (req, res) => {
  const params = req.body;
  isAuthenticated(params.token)
    .then(player => joinGame(params.gameId, player.uid))
    .then(gameId => res.send(gameId))
    .catch(err => res.send(err));
});
app.get("/leaderboard", (req, res) => {
  const params = req.headers;
  isAuthenticated(params.token)
    .then(getLeaderBoard)
    .then(leaderBoard => res.send(leaderBoard))
    .catch(err => res.send({ err }));
});
app.all("**", (req, res) => {
  res.sendStatus(404);
});
exports.creatUserProfile = functions.auth.user().onCreate(createPlayerProfile);

exports.api = functions.https.onRequest(app);
