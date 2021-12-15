module.exports = function(app, passport, User) {

    /**
     * Handle GET request for the route /register to display the register page to user
     */
    app.get("/register", function(req, res) {
        res.render("register", {
            errorMessage: ""
        })
    });
    
    /**
     * Handle POST request for the route /register to receive the details of the register form and creating a new user to the application
     */
    app.post("/register", function(req, res) {
    
        User.register({username: req.body.username, fname: req.body.fname, lname: req.body.lname, displayName: req.body.fname + " " + req.body.lname}, req.body.password, function(err, user){
            if(err) {
                console.log(err);
    
                let user = User.find({ username: { $eq: req.body.username }});
    
                if (user != null) {
                    res.render("register", {
                        errorMessage: "Usename with the same name already exists."
                    });
                }
                else {
                    res.redirect("/register");
                }
    
                res.redirect("/register");
            } else {
                passport.authenticate("local") (req, res, function() {
                    res.redirect("/dashboard");
                });
            }
        });
    });
    
}