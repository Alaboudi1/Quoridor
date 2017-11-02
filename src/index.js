// Here should go all the javascript code, you could aslo import whatever you want for example:
import { auth } from "./database/auth";
import { db } from "./database/db";
import { user } from "./user";
import PubSub from "pubsub-js";

class index {
  constructor() {
    this.db = new db();
    this.auth = new auth();
    this.user = new user();
    this.subscrube();
    this.hide(mainPage);
  }

  mainPageRender() {
    gamesDIV.innerHTML = "";
    this.existingGames.forEach(
      element =>
        (gamesDIV.innerHTML += `<br><button id = ${element.gameId} class = "existingGames" > ${element.gameName}</button>`)
    );
    this.registerEventListeners();
  }
  registerEventListeners() {
    Array.from(document.getElementsByClassName("existingGames")).forEach(ele =>
      ele.addEventListener("click", () => this.joinAgame(ele.id))
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
  createGame(id) {
    this.db.createNewWaitingGame(
      gameName.value,
      this.user
    );
  }
  joinAgame(id) {
    this.db.joinExistingGame(id, this.auth.auth.currentUser.displayName); //need API for name
  }
  checkStatus(user) {
    if (user) {
      this.user.setInfo(user.displayName, user.uid);
      
      this.show(logOut);
      this.show(lableName);
      this.show(mainPage);
      this.hide(form);
      this.hide(errMessage);
      if (user.displayName) this.updateUserName(user.displayName);
    } else {
      this.user.setInfo("", "");
      this.show(form);
      this.hide(logOut);
      this.hide(lableName);
      this.hide(mainPage);
    }
  }
  subscrube() {
    PubSub.subscribe("newWaitingGames", (mag, data) => {
      if (data) {
        this.existingGames = Object.keys(data).map(key => data[key]);
      } else {
        this.existingGames = [];
      }
      this.mainPageRender();
    });
    PubSub.subscribe("currentGame", (meg, data) => (this.currentGame = data)); //waiting for the second player to join!
    PubSub.subscribe("nameUpdate", (meg, name) => this.updateUserName(name));
    PubSub.subscribe("authChange", (meg, user) => this.checkStatus(user));
    PubSub.subscribe("authErro", (msg, data) => {
      console.log(data.message);
      this.show(errMessage);
      errMessage.textContent = data.message;
    });
  }
  hide(element) {
    element.style.display = "none";
  }
  show(element) {
    element.style.display = "";
  }

  updateUserName(name) {
    lableName.textContent = `Welcome: ${name}`;
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
