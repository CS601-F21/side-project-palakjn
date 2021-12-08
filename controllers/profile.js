
module.exports = function(app, User) {

    app.get("/profile", function(req, res) {
        if (req.isAuthenticated()) {
            User.find({_id: {$eq: req.user._id}}, function(err, user) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {            
                    res.render("profile", {
                        "user": user[0]
                    });                                 
                }
            })
        } else {
            res.redirect("/login");
        }
    });

}