const dbManager = require("./dbManager");

module.exports = function(app) {
    let Client = dbManager.createClientCollection();

    app.get("/clients", function(req, res) {
        if (req.isAuthenticated()) {            
            Client.find({userId: {$eq: req.user._id}}, function(err, allClients) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {                
                    res.render("clients", {
                        existClient: "",
                        clients: allClients
                    });
                }
            });
        } else {
            res.redirect("/login");
        }
    });

    app.post("/addClient", function(req, res) { 
        if (req.isAuthenticated()) {             
            Client.find({userId: {$eq: req.user._id}}, function(err, allClients) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {
                    if(allClients.some(client => client.name === req.body.name)) {
                        res.render("clients", {
                            existClient: "Client with the name " + req.body.name + " already exists.",
                            clients: allClients
                        });
                    } else {                         
                        const client = new Client({
                            name: req.body.name,
                            userId: req.user._id
                        });

                        client.save(function(err, user) {
                            if(err) {
                                console.error(err);
                            }
                            console.log(user.name + " saved to clients collection");
                        });

                        res.redirect("/clients");
                    }
                }
            })
        } else {
            res.redirect("/login");
        }
    });    
}