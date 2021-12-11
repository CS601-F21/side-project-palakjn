
module.exports = function(app, passport, User) {

    /**
     * Handles GET request for the route "/login" to display login page
     */
    app.get("/login", function(req, res) {
        res.render("login", {
            errorMessage: ""
        })
    });

    /**
     * Handles POST request for the route "/login" to login to the system with username and password
     */
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
                    res.render("login", {
                        errorMessage: "Unable to login. Try again later!"
                    });
                } else {
                    return res.redirect("/dashboard");
                }
            });        
        }) (req, res)    
    });

    /**
     * Handles GET request for /auth/google to allow user to login with google
     */
    app.get("/auth/google", 
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    /**
     * This is the redirect URL being called by Google after authenticating the user
     */
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
                    res.render("login", {
                        errorMessage: "Unable to login. Try again later!"
                    });
                } else {
                    return res.redirect("/dashboard");
                }
            });        
        }) (req, res)    
     });     

     /**
      * Handles GET request for the route /dashboard to display the home page of a user after user is being authenticated
      */
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

    /**
     * Handles GET request for the route /changepassword to display the page for changing the password
     */
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

    /**
     * Handles POST request for the route /changepassword to let user to change the password
     */
    app.post("/changepassword", async function(req, res) {
        if(req.isAuthenticated()) {
            let user = await User.findById({_id: req.user._id});

            user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
                if(err) {
                    console.log("Unable to change the password. " + err);
                    let errorMessage = "Server Error. Try Again Later!";

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