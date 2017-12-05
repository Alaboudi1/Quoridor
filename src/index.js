import { auth } from "./database/auth";
import { api } from "./database/api";
import { user } from "./user";
import PubSub from "pubsub-js";
import { serverCommunication } from "./serverCommunication";
import { drawBoard } from "./drawBoard";
import { gameLogic } from "./gameLogic";
import { drawGameInfo } from "./drawGameInfo";
import JSONFormatter from "json-formatter-js";
class index {
  constructor() {
    this.subscribe();
    this.api = new api();
    this.auth = new auth();
    this.user = new user();
    this.hide(mainPage);
    this.serverCom = new serverCommunication(this.api, this.user);
    this.logic = new gameLogic();
    this.drawer = new drawBoard();
    this.gameInfo = new drawGameInfo();
    this.serverCom.init();
  }

  waitingGameRender() {
    waitingGames.innerHTML = "";
    this.existingGames.forEach(
      game =>
        (waitingGames.innerHTML += `<button type="button" id="${
          game.gameId
        }" class="two waitingGame">Join ${game.gameName}</button>
        `)
    );
    this.registerEventListeners();
  }

  registerEventListeners() {
    Array.from(document.getElementsByClassName("waitingGame")).forEach(ele =>
      ele.addEventListener("click", () => this.joinGame(ele.id))
    );
  }

  manageAuth(action, e) {
    e.preventDefault();
    switch (action) {
      case "logIn":
        this.auth.logIn(email.value, pass.value);
        break;
      case "logOut":
        this.auth.logout();
        this.hide(mainPage);
        this.hide(login);
        this.show(homePage);
        this.hide(leaderboard);
        errMessage.textContent = "";
        this.api.cancelGamesSubscription(this.user.gameId);
        break;
      case "signUp":
        if (pass.value.length < 8) {
          errMessage.textContent =
            "Password has to be at least 8 characters in length";
          this.show(errMessage);
        } else {
          this.hide(errMessage);
          this.auth.signUp(email.value, pass.value);
        }
        break;
      default:
        throw new Error("UnsupportedOperation:manageAuth");
    }
  }

  displaytable() {
    this.hide(mainPage);
    this.show(leaderboard);
    document.getElementById("backButton").addEventListener("click", () => {
      this.hide(leaderboard);
      this.show(mainPage);
    });
  }

  displayAuthFormPage() {
    this.show(authForm);
    this.hide(homePage);
  }

  createGame() {
    this.api
      .createNewWaitingGame(newGame.value, this.user.token)
      .then(gameId => {
        this.user.setGameId(gameId);
        PubSub.publish("GAME_ID", [gameId]);
      })
      .then(() => this.api.GameSubscription(this.user.gameId))
      .then(() => {
        this.hide(mainPage);
        this.show(gameDIV);
      })
      .catch(err => console.log(err));
  }

  joinGame(gameId) {
    this.api
      .joinExistingGame(gameId, this.user.token)
      .then(gameId => {
        this.user.setGameId(gameId);
        PubSub.publish("GAME_ID", [gameId]);
      })
      .then(() => this.api.GameSubscription(this.user.gameId))
      .then(() => {
        this.hide(mainPage);
        this.show(gameDIV);
      })
      .catch(err => console.log(err));
  }

  checkStatus(user) {
    if (user) {
      this.user.setName(user.email);
      this.show(loader);
      setTimeout(
        // reconstructing user profile
        () =>
          this.auth
            .getIdToken()
            .then(token => {
              this.user.setToken(token);
              this.serverCom.setUserToken(token);
            })
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
            .then(() => {
              if (this.user.gameId != 0) {
                this.showGamePage();
              } else {
                this.showMainPage();
              }
            })
            .then(() => this.api.newWaitingGameSubscription())

            .catch(err => console.log(err)),
        5000
      );

      if (user.displayName) this.updateUserName(user.email);
      lableName.textContent = `Welcome ${this.user.name}`;
    } else {
      this.user.setToken("");
      this.show(homePage);
      this.hide(lableName);
      this.hide(mainPage);
    }
  }

  showMainPage() {
    this.show(lableName);
    this.show(mainPage);
    this.hide(authForm);
    this.hide(homePage);
    this.hide(loader);
    this.hide(gameDIV);
    errMessage.textContent = "";
  }

  showGamePage() {
    this.hide(mainPage);
    this.show(gameDIV);
    this.show(errMessage);
    this.hide(homePage);
    this.hide(loader);
    errMessage.textContent = "";
  }

  subscribe() {
    PubSub.subscribe("newWaitingGames", (mag, data) => {
      console.log(data);
      if (data) {
        this.existingGames = Object.keys(data).map(key => data[key]);
      } else {
        this.existingGames = [];
      }
      this.waitingGameRender();
    });
    PubSub.subscribe("gameChange", (meg, data) => {
      console.log(data);
      errMessage.textContent = data.message;
      if (data["gameStatus"].winner !== 0) {
        errMessage.textContent = `The winner is ${data["gameStatus"].winner}`;
        this.api.cancelGamesSubscription(this.user.gameId);
        clearInterval(this.tInterval);
        this.show(lableName);
        this.show(mainPage);
        this.hide(gameDIV);
      } else this.timer();
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
    element.style.display = "block";
  }

  updateUserName(name) {
    labelName.textContent = `Welcome: ${name}`;
  }

  timer() {
    clearInterval(this.tInterval);
    this.tInterval = setInterval(() => {
      this.api
        .timeout(this.user.token, this.user.gameId)
        .then(time => (timer.textContent = time))
        .catch(err => (timer.textContent = "Time Up!"));
    }, 1000);
  }

  leaveGame() {
    this.api
      .leaveGame(this.user.gameId, this.user.token)
      .then(() => this.showMainPage())
      .catch(err => console.log(err));
  }

  playMove(gameState) {
    this.api
      .setMove(this.user.gameId, this.user.token, gameState)
      .catch(err => console.log(err));
  }

  getLeaderBoard() {
    this.api
      .getLeaderBoard(this.user.token)
      .then(players => this.displayTable(players));
  }
  gameHistory() {
    this.show(loader);
    renderGamesHistory.innerHTML = `<span><button type="button" id="backButton2" class="myButt two">Back</button></span>`;
    this.api
      .gameHistory(this.user.token)
      .then(games =>
        document
          .getElementById("renderGamesHistory")
          .appendChild(new JSONFormatter(games).render())
      )
      .then(() => {
        this.hide(mainPage);
        this.show(renderGamesHistory);
        this.hide(loader);
        document.getElementById("backButton2").addEventListener("click", () => {
          this.hide(renderGamesHistory);
          this.show(mainPage);
        });
      });
  }
  displayTable(players) {
    var html = "<table border='1|1'>";
    html += "<tr>";
    html += "<th>" + "Lost" + "</th>";
    html += "<th>" + "Win" + "</th>";
    html += "<th>" + "numberOfGamesPlayed" + "</th>";
    html += "<th>" + "userName" + "</th>";
    html += "</tr>";
    for (var i = 0; i < players.length; i++) {
      html += "<tr>";
      html += "<td>" + players[i].lost + "</td>";
      html += "<td>" + players[i].won + "</td>";
      html += "<td>" + players[i].numberOfGamesPlayed + "</td>";
      html += "<td>" + players[i].userName + "</td>";
      html += "</tr>";
    }
    html += "</table>";
    this.hide(mainPage);
    errMessage.textContent = "";
    this.show(leaderboard);
    document.getElementById("backButton").addEventListener("click", () => {
      this.hide(leaderboard);
      this.show(mainPage);
    });
    document.getElementById("leadertable").innerHTML = html;
  }
}

const app = new index();

document
  .getElementById("authButton")
  .addEventListener("click", () => app.displayAuthFormPage());
document
  .getElementById("logIn")
  .addEventListener("click", e => app.manageAuth("logIn", e));
document
  .getElementById("logOut")
  .addEventListener("click", e => app.manageAuth("logOut", e));
document
  .getElementById("signUp")
  .addEventListener("click", e => app.manageAuth("signUp", e));
document
  .getElementById("createGame")
  .addEventListener("click", () => app.createGame());
document
  .getElementById("leave")
  .addEventListener("click", () => app.leaveGame());
document
  .getElementById("gameStats")
  .addEventListener("click", () => app.getLeaderBoard());
document
  .getElementById("gamesHistory")
  .addEventListener("click", () => app.gameHistory());
