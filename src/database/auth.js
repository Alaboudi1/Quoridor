import firebase from "firebase";
import PubSub from "pubsub-js";
export class auth {
  // @required subscributions:
  //1. authChange -> the updated status of the user when the auth state changes e.g. user == null means user is no longer loged in.
  constructor() {
    this.auth = firebase.auth();
    this.authenticationStatus();
  }

  // @required subscributions:
  // 1. nameUpdate -> the name of the user.
  // 2. error -> the error that occurs while trying to create the user.

  signUp(username, pass, name) {
    this.auth
      .createUserWithEmailAndPassword(username, pass)
      .then(user => {
        user.updateProfile({ displayName: name });
        return user;
      })
      .then(user => this.publish("authChange", user))
      .catch(err => this.publish("error", err));
  }
  getIdToken() {
    return new Promise((res, rej) => {
      this.auth.currentUser
        .getToken(true)
        .then(idToken => res(idToken))
        .catch(err => rej(err));
    });
  }

  // @required subscributions:
  // 1. error -> the error that occurs while trying to login the user.
  logIn(username, pass) {
    this.auth
      .signInWithEmailAndPassword(username, pass)
      .catch(err => this.publish("error", err));
  }

  // @required subscributions:
  // 1. error -> the error that occurs while trying to logout the user.
  logout() {
    this.auth.signOut().catch(err => this.publish("error", err));
  }
  authenticationStatus() {
    this.auth.onAuthStateChanged(user => {
      this.publish("authChange", user);
    });
  }
  publish(message, data) {
    PubSub.publish(message, data);
  }
}
