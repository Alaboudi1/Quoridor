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
// 2. authErro -> the error that occurs while trying to create the user.
   
  signUp(username, pass, name) {
    this.auth
      .createUserWithEmailAndPassword(username, pass)
      .then(user => {
        this.publish("nameUpdate",name);
        user
          .updateProfile({ displayName: name })
          .catch(err => this.publish("authErro", err));
      })
      .catch(err => this.publish("authErro", err));
  }
    
// @required subscributions:
// 1. authErro -> the error that occurs while trying to login the user.
  logIn(username, pass) {
    this.auth
      .signInWithEmailAndPassword(username, pass)
      .then(user => console.log(user))
      .catch(err => this.publish("authErro", err));
  }
      
// @required subscributions:
// 1. authErro -> the error that occurs while trying to logout the user.
  logout() {
    this.auth
      .signOut()
      .catch(err => this.publish("authErro", err));
  }
  authenticationStatus() {
    this.auth.onAuthStateChanged(user => this.publish("authChange", user));
  }
  publish(message, data) {
    PubSub.publish(message, data);
  }
}
