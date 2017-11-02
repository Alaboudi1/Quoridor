const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

admin.initializeApp(functions.config().firebase);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
const app = express();

app.put("/setMove", (req, res) => {
  const params = req.body;
  if(params.message){
  params.message = params.message +" Abdulaziz";
  res.set("Content-Type", "application/json");
  res.send(params);
  }
  else
  res.send(400);

});

app.post("/createGame", (req, res) => {
  const params = req.body;
  if(params.message){
  params.message = params.message +" Abdulaziz";
  res.set("Content-Type", "application/json");
  res.send(params);
  }
  else
  res.send(400);

});

app.put("/joinGame", (req, res) => {
  const params = req.body;
  if(params.message){
  params.message = params.message +" Abdulaziz";
  res.set("Content-Type", "application/json");
  res.send(params);
  }
  else
  res.send(400);

});
app.all("**", (req, res) => {
  
  res.send(404);

});

exports.api = functions.https.onRequest(app);
