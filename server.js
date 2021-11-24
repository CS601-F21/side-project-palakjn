require('dotenv').config();
require("ejs");

const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
let passport = require('passport');

const initPassport = require("./init");
const login = require("./login");
const register = require("./register");
const logout = require("./logout");
const clients = require("./clients");
const dbManager = require("./dbManager");

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

dbManager.initDB();
User = dbManager.createUserCollection();
passport = initPassport.getPassport(passport, User);

login(app, passport, User);
register(app, passport, User);
logout(app);

clients(app);

app.get("/", function(req, res) {
    res.render("home")
});

app.listen(process.env.PORT, function() {
    console.log("Server started on port " + process.env.PORT);
  });
