const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { isAuthenticated, isAuthorized, getPlayerInfo } = require("./auth");
const {
  createGame,
  joinGame,
  setMove,
  createPlayerProfile,
  getLeaderBoard
} = require("./game");
const corsOptions = {
  origin: "https://quoridor-swe681.firebaseapp.com",
  optionsSuccessStatus: 200
};
const helmet = require("helmet");
const app = express();
app.use(
  helmet.hsts({
    maxAge: 7776000000,
    includeSubdomains: true
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  })
);
app.use(cors(corsOptions));

app.put("/setMove", (req, res) => {
  const params = req.body;
  isAuthenticated(params.token)
    .then(player => isAuthorized(params.gameId, player.uid))
    .then(playerId => setMove(playerId, params.gameId, params.move))
    .catch(err => res.send({ err }));
});

app.post("/createGame", (req, res) => {
  const params = JSON.parse(req.body);
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
