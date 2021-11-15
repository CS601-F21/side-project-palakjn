require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const googleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

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

mongoose.connect("mongodb://" + process.env.DB_HOST + "/userDB", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log(`connection to database established`)
}).catch(err=>{
    console.log(`db error ${err.message}`);
    process.exit(-1)
});

const userSchema = new mongoose.Schema ({
    fname: String,
    lname: String,
    email: String,
    password: String,
    googleId: String,
    displayName: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new googleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3032/auth/google/dashboard",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({username: profile.emails[0].value, googleId: profile.id, displayName: profile.displayName}, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res) {
    res.render("home")
});

app.get("/login", function(req, res) {
    res.render("login")
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/dashboard");
            });
        }
    });
});

app.get("/register", function(req, res) {
    res.render("register")
});

app.post("/register", function(req, res) {

    User.register({username: req.body.username, fname: req.body.fname, lname: req.body.lname, displayName: req.body.fname + " " + req.body.lname}, req.body.password, function(err, user){
        if(err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/dashboard");
            });
        }
    });
});

app.get("/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/dashboard",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
        //Successful authentication, redirect home.
        res.redirect("/dashboard");
    });

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/dashboard", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("dashboard", {
            displayName: req.user.displayName
        });
    } else {
        res.redirect("/login");
    }
});

app.listen(process.env.PORT, function() {
    console.log("Server started on port 3000");
  });
