
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
                displayName: req.user.displayName
            });
        } else {
            res.redirect("/login", {
                errorMessage: ""
            });
        }
    });
}