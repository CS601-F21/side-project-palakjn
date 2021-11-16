require('dotenv').config();
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const googleStrategy = require('passport-google-oauth20').Strategy;

const userSchema = require("./models/userSchema.js");

exports.initDB = function() {
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
}

exports.createUserCollection = function() {
    const user = userSchema.getUserSchema();
    user.plugin(passportLocalMongoose);
    user.plugin(findOrCreate);

    return new mongoose.model("User", user);
}

exports.getPassport = function(passport, User) {
    passport.use(User.createStrategy());

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new googleStrategy(
        {
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

    return passport;
}