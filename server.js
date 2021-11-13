const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", function(req, res) {
    res.render("home")
});

app.get("/login", function(req, res) {
    res.render("login")
});

app.get("/register", function(Req, res) {
    res.render("register")
});

app.get("/dashboard", function(Req, res) {
    res.render("dashboard")
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
