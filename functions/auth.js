const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const isAuthenticated = idToken =>
  new Promise((res, rej) =>
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(decodedToken => res(decodedToken))
      .catch(err => rej({ err: "Failed to Authenticate" }))
  );
const isAuthorized = (gameId, userId) =>
  new Promise((res, rej) =>
    admin
      .database()
      .ref($`/games/${gameId}/private/nextPlayer`)
      .once(
        data =>
          data.val()["id"] === userId ? res(userId) : rej("Not Authorized")
      )
      .catch(err => rej({ err: "Unauthorized Access" }))
  );
const getPlayerInfo = uid =>
  new Promise((res, rej) =>
    admin
      .auth()
      .getUser(uid)
      .then(player => res(player))
      .catch(err => rej({ err: "Failed to Authenticate" }))
  );
module.exports = { isAuthenticated, isAuthorized, getPlayerInfo };
