require('dotenv').config();
require("ejs");

const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
let passport = require('passport');

const initPassport = require("./utilities/init");
const login = require("./controllers/login");
const register = require("./controllers/register");
const logout = require("./controllers/logout");
const clients = require("./controllers/clients");
const dbManager = require("./utilities/dbManager");
const photos = require("./controllers/photos");
const messages = require("./controllers/messages");

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
let User = dbManager.createUserCollection();
let Client = dbManager.createClientCollection();  
let Message = dbManager.createMessageCollection();

passport = initPassport.getPassport(passport, User);

login(app, passport, User);
register(app, passport, User);
logout(app);

clients(app, Client);
photos(app, Client, User, Message);
messages(app, Client, Message);

app.get("/", function(req, res) {
    res.render("home")
});

app.listen(process.env.PORT, function() {
    console.log("Server started on port " + process.env.PORT);
  });
