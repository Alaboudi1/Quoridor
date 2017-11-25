// type
import { auth } from "./database/auth";
import { api } from "./database/api";
import { user } from "./user";
import PubSub from "pubsub-js";

class index {
  constructor() {
    this.api = new api();
    this.auth = new auth();
    this.user = new user();
    this.subscribe();
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
      .then(() => this.api.GameSubscription(gameId))
      .catch(err => (errMessage.textContent = data));
  }
  joinGame(gameId) {
    this.api
      .joinExistingGame(gameId, this.user.token)
      .then(gameId => this.user.setGameId(gameId))
      .then(() => this.api.GameSubscription(gameId))
      .catch(err => (errMessage.textContent = data));
  }
  checkStatus(user) {
    if (user) {
      this.user.setName(user.email);
      this.auth
        .getIdToken()
        .then(token => this.user.setToken(token))
        .then(() =>
          this.api
            .getPlayerProfile(this.user.token)
            .then(profile => this.user.setGameId(profile.currentlyPlaying))
        )
        .catch(err => console.log(err));
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
      if (data) {
        this.existingGames = Object.keys(data).map(key => data[key]);
      } else {
        this.existingGames = [];
      }
      this.mainPageRender();
    });
    PubSub.subscribe("gameChange", (meg, data) => console.log(data));
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
document.getElementById("leave").addEventListener("click", () => app.leaveGame());
