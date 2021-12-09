
module.exports = function(app, passport, User) {
    app.get("/login", function(req, res) {
        res.render("login", {
            errorMessage: ""
        })
    });

    app.post("/login", function(req, res) {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
    
        passport.authenticate("local", function(err, user, info) {
            if(err) {
                console.log(err);
    
                return res.render("login", {
                    errorMessage: "Authentication attempt has failed, likely due to an interval error. Try again after some time and contact us if problem persists."
                });
            }
            if(!user) {
                return res.render("login", {
                    errorMessage: "Authentication attempt has failed, likely due to invalid credentials. Please verify and try again."
                });
            }
            req.login(user, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    return res.redirect("/dashboard");
                }
            });        
        }) (req, res)    
    });

    app.get("/auth/google", 
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/auth/google/dashboard", function(req, res) {
        passport.authenticate("google", function(err, user, info) {
            if(err) {
                console.log(err);
    
                return res.render("login", {
                    errorMessage: "Authentication attempt has failed, likely due to an interval error. Try again after some time and contact us if problem persists."
                });
            }
    
            req.login(user, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    return res.redirect("/dashboard");
                }
            });        
        }) (req, res)    
     });     

    app.get("/dashboard", function(req, res) {
        if (req.isAuthenticated()) {
            res.render("dashboard", {
                displayName: req.user.displayName,
                googleUser: req.user.googleId ? true : false
            });
        } else {
            res.redirect("/login");
        }
    });

    app.get("/changepassword", function(req, res) {
        if(req.isAuthenticated()) {
            res.render("changepassword", {
                googleUser: req.user.googleId ? true : false,
                error: null
            });
        } else {
            res.redirect("/login");
        }
    });

    app.post("/changepassword", async function(req, res) {
        if(req.isAuthenticated()) {
            let user = await User.findById({_id: req.user._id});

            user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
                if(err) {
                    //TODO: Report error in UI
                    console.log("Unable to change the password. " + err);
                    let errorMessage = null;

                    if(err == "IncorrectPasswordError: Password or username is incorrect") {
                        errorMessage = "Old password is incorrect";
                    }

                    res.render("changepassword", {
                        googleUser: req.user.googleId ? true : false,
                        error: errorMessage
                    });
                } else {
                    console.log("Changed Password successfully");

                    res.redirect("/dashboard");
                }
            });    
        } else {
            res.redirect("/login");
        }
    });
}