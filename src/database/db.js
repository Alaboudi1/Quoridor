import firebase from "firebase";
import { config } from "./dbconfig";
import PubSub from "pubsub-js";
export class db {
  // @required subscriptions:
  //1.newWaitingGames -> waiting games list.
  constructor() {
    firebase.initializeApp(config);
    this.database = firebase.database();
    this.newWaitingGameSubscription();
  }
  createNewWaitingGame(gameName, idToken) {
    this.cancelWaitingGamesSubscription();
    fetch(
      "https://us-central1-quoridor-swe681.cloudfunctions.net/api/creategame",
      {
        method: "POST",
        body: JSON.stringify({
          gameName,
          token: idToken
        })
      }
    )
      .then(payload => payload.json())
      .then(payload => (payload.err ? Promise.reject() : payload))
      .then(gameId => this.publish("currentGame", { gameName, gameId }))
      .catch(err => this.publish("error", err.err.message));
  }
  //@scope: private
  generateKey() {
    return this.database
      .ref()
      .child("keys")
      .push().key;
  }
  joinExistingGame(gameId, username) {
    this.findThisGame(gameId)
      .then(game => this.removeFromWaitingGames(game))
      .then(game => this.joiningGame(game, username))
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
  joiningGame(game, playerName) {
    const playerTwoId = this.generateKey();
    const status = {};
    const messages = {};
    const playKey = "none";
    const playerNumber = "playerTwo";
    this.cancelWaitingGamesSubscription();
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
  RegisterOneMove() {}
  ReceiveOneMove() {}

  //@scope:private
  newWaitingGameSubscription() {
    this.database
      .ref("waitingGames")
      .on("value", snapshot => this.publish("newWaitingGames", snapshot.val()));
  }
  //@scope:private
  cancelWaitingGamesSubscription() {
    this.database.ref("waitingGames").off();
  }
  publish(message, data) {
    PubSub.publish(message, data);
  }
}
