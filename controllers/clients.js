const storage = require("../utilities/storage");
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

module.exports = function(app, Client) {

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

    app.post("/clients", function(req, res) { 
        if (req.isAuthenticated()) {             
            Client.find({userId: {$eq: req.user._id}}, function(err, allClients) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {
                    if(allClients.some(client => client.email === req.body.email)) {
                        res.render("clients", {
                            existClient: "Client with the email " + req.body.email + " already exists.",
                            clients: allClients
                        });
                    } else {                           
                        var containerName = uuid.v1();

                        //Creating container in Azure Blob
                        storage.createContainer(containerName);

                        const client = new Client({                       
                            userId: req.user._id,
                            name: req.body.name,
                            email: req.body.email,
                            city: req.body.city,
                            state: req.body.state,
                            country: req.body.country,
                            zip: parseInt(req.body.zip),
                            date: Date.parse(req.body.date),
                            container: containerName
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