const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const isAuthenticated = idToken => {
  return new Promise((res, rej) => {
    admin
      .auth()
      .verifyIdToken(idToken)
      .then(decodedToken => res(decodedToken))
      .catch(error => rej(error));
  });
};

module.exports = { isAuthenticated };
