import { auth } from "./database/auth";
import { api } from "./database/api";
import { user } from "./user";
import PubSub from "pubsub-js";

class index {
  constructor() {
    this.subscribe();
    this.api = new api();
    this.auth = new auth();
    this.user = new user();
    this.hide(mainPage);
  }

  mainPageRender() {
    gamesDIV.innerHTML = "";
    this.existingGames.forEach(
      game =>
        (gamesDIV.innerHTML += `<br><button id = ${
          game.gameId
        } class = "existingGames" > ${game.gameName}</button>`)
    );
    this.registerEventListeners();
  }
  registerEventListeners() {
    Array.from(document.getElementsByClassName("existingGames")).forEach(ele =>
      ele.addEventListener("click", () => this.joinGame(ele.id))
    );
  }
  manageAuth(action) {
    switch (action) {
      case "logIn":
        this.auth.logIn(email.value, pass.value);
        break;
      case "logOut":
        this.auth.logout();
        this.api.cancelGamesSubscription(this.user.gameId);
        break;
      case "signUp":
        this.auth.signUp(email.value, pass.value, username.value);
        break;
      default:
        throw new Error("UnsupportedOperation:manageAuth");
    }
  }
  createGame() {
    this.api
      .createNewWaitingGame(gameName.value, this.user.token)
      .then(gameId => this.user.setGameId(gameId))
      .then(() => this.api.GameSubscription(this.user.gameId))
      .catch(err => console.log(err));
  }
  joinGame(gameId) {
    this.api
      .joinExistingGame(gameId, this.user.token)
      .then(() => this.user.setGameId(gameId))
      .then(() => this.api.GameSubscription(this.user.gameId))
      .catch(err => console.log(err));
  }
  checkStatus(user) {
    if (user) {
      this.user.setName(user.email);
      setTimeout(
        // reconstructing user profile
        () =>
          this.auth
            .getIdToken()
            .then(token => this.user.setToken(token))
            .then(() =>
              this.api
                .getPlayerProfile(this.user.token)
                .then(profile => this.user.setGameId(profile.currentlyPlaying))
            )
            .then(
              () =>
                this.user.gameId != 0
                  ? this.api.GameSubscription(this.user.gameId)
                  : this.user.gameId
            )
            .then(() => this.api.newWaitingGameSubscription())
            .catch(err => console.log(err)),
        5000
      );
      this.show(logOut);
      this.show(labelName);
      this.show(mainPage);
      this.show(leave);
      this.hide(form);
      this.hide(errMessage);
      if (user.displayName) this.updateUserName(user.email);
    } else {
      this.user.setToken("");
      this.show(form);
      this.hide(logOut);
      this.hide(labelName);
      this.hide(mainPage);
    }
  }
  subscribe() {
    PubSub.subscribe("newWaitingGames", (mag, data) => {
      console.log(data);
      if (data) {
        this.existingGames = Object.keys(data).map(key => data[key]);
      } else {
        this.existingGames = [];
      }
      this.mainPageRender();
    });
    PubSub.subscribe("gameChange", (meg, data) => {
      if (data.nextPlayer === 0)
        //game is over
        this.api.cancelGamesSubscription(this.user.gameId);

      console.log(data.message);
    });
    PubSub.subscribe("authChange", (meg, user) => this.checkStatus(user));
    PubSub.subscribe("error", (msg, data) => {
      this.show(errMessage);
      errMessage.textContent = data;
    });
  }
  hide(element) {
    element.style.display = "none";
  }
  show(element) {
    element.style.display = "";
  }

  updateUserName(name) {
    labelName.textContent = `Welcome: ${name}`;
  }
  leaveGame() {
    this.api.leaveGame(this.user.gameId, this.user.token);
  }
  playMove(gameState) {
    this.api.setMove(this.user.gameId, this.user.token, gameState);
  }
  getLeaderBoard() {
    this.api
      .getLeaderBoard(this.user.token)
      .then(players => console.log(players));
  }
}

const app = new index();
document
  .getElementById("logIn")
  .addEventListener("click", () => app.manageAuth("logIn"));
document
  .getElementById("logOut")
  .addEventListener("click", () => app.manageAuth("logOut"));
document
  .getElementById("signUp")
  .addEventListener("click", () => app.manageAuth("signUp"));
document
  .getElementById("createGame")
  .addEventListener("click", () => app.createGame());
document
  .getElementById("leave")
  .addEventListener("click", () => app.leaveGame());
document
  .getElementById("playMove")
  .addEventListener("click", () => app.playMove());
document
  .getElementById("leaderBoard")
  .addEventListener("click", () => app.getLeaderBoard());
