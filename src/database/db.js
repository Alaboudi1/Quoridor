import firebase from "firebase";
import { config } from "./dbconfig";
import PubSub from "pubsub-js";
export class db {
  // @required subscributions:
  //1.newWaitingGames -> waiting games list.
  constructor() {
    firebase.initializeApp(config);
    this.database = firebase.database();
    this.newWaitingGameSubscribtion();
  }
  createNewWaitingGame(gameName, idToken) {
    this.cancelWaitingGamesSubscribtion();
    fetch("https://us-central1-quoridor-swe681.cloudfunctions.net/api", {
      method: "POST",
      token: idToken,
      body: {
        gameName
      }
    }).then(gameId => this.publish("currentGame", { gameName, gameId }))
    .catch(err => this.publish("error", err));
  }
  //@scope: private
  generatekey() {
    return this.database
      .ref()
      .child("keys")
      .push().key;
  }
  joinExistingGame(gameId, username) {
    this.findThisGame(gameId)
      .then(game => this.removeFromWaitingGames(game))
      .then(game => this.joningGame(game, username))
      .catch(err => console.log(err));
  }
  //@scope: private
  removeFromWaitingGames(game) {
    return new Promise((res, rej) =>
      this.database
        .ref(`/waitingGames/${game.gameId}`)
        .remove()
        .then(() => res(game))
        .catch(err => rej(err))
    );
  }
  //@scope private
  joningGame(game, playerName) {
    const playerTwoId = this.generatekey();
    const status = {};
    const messages = {};
    const playKey = "none";
    const playerNumber = "playerTwo";
    this.cancelWaitingGamesSubscribtion();
    return new Promise((res, rej) =>
      this.database
        .ref(`/currentGames/${game.gameId}/${playerTwoId}`)
        .set({ status, messages, playKey, playerNumber, playerName })
        .then(() => res())
        .catch(err => rej(err))
    );
  }

  //@scope: private
  findThisGame(gameId) {
    return new Promise((res, rej) =>
      this.database
        .ref(`/waitingGames/${gameId}`)
        .once("value")
        .then(snapshot => snapshot.val())
        .then(game => (game ? res(game) : rej("Not fount")))
    );
  }
  //TODO
  RigisterOneMove() {}
  ReceiveOneMove() {}


  //@scope:private
  newWaitingGameSubscribtion() {
    this.database
      .ref("waitingGames")
      .on("value", snapshot => this.publish("newWaitingGames", snapshot.val()));
  }
  //@scope:private
  cancelWaitingGamesSubscribtion() {
    this.database.ref("waitingGames").off();
  }
  publish(message, data) {
    PubSub.publish(message, data);
  }
}
