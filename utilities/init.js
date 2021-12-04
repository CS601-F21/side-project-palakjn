require('dotenv').config();
const googleStrategy = require('passport-google-oauth20').Strategy;

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
        function(_accessToken, _refreshToken, profile, cb) {
            User.findOrCreate({username: profile.emails[0].value, googleId: profile.id, displayName: profile.displayName}, function (err, user) {
            return cb(err, user);
            });
         }
    ));

    return passport;
}