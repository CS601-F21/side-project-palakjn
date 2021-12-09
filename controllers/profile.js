const StringBuffer = require("../utilities/stringHandler");

module.exports = function(app, User) {

    app.get("/profile", function(req, res) {
        if (req.isAuthenticated()) {
            User.find({_id: {$eq: req.user._id}}, function(err, user) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {    
                    if(user.length == 1) {   
                        res.render("profile", {
                            user: user[0],
                            googleUser: req.user.googleId ? true : false
                        });  
                    } else {
                        //TODO: Handle error
                    }                        
                }
            })
        } else {
            res.redirect("/login");
        }
    });

    app.post("/profile", async function(req, res) {
        if (req.isAuthenticated()) {

            let phone = new StringBuffer();
            phone.append(req.body.countryCode);
            phone.append('-');
            phone.append(req.body.areaCode);
            phone.append('-');
            phone.append(req.body.exchangeCode);
            phone.append('-');
            phone.append(req.body.lineNumber);

            await User.findByIdAndUpdate({_id: req.user._id}, {"$set": {"displayName": req.body.name, 
                                                                        "address": req.body.address,
                                                                        "city": req.body.city,
                                                                        "state": req.body.state,
                                                                        "country": req.body.country,
                                                                        "zip": req.body.zip,
                                                                        "phone": phone.toString()}});

            res.redirect("/profile");
        } else {
            res.redirect("/login");
        }
    });
}