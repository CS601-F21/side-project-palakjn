const storage = require("../utilities/storage");
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

module.exports = function(app, Client, Message) {

    app.get("/clients", function(req, res) {
        if (req.isAuthenticated()) {            
            Client.find({userId: {$eq: req.user._id}}, function(err, allClients) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {                
                    res.render("clients", {
                        existClient: "",
                        clients: allClients,
                        googleUser: req.user.googleId ? true : false
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
                            clients: allClients,
                            googleUser: req.user.googleId ? true : false
                        });
                    } else {                           
                        var photoContainerName = uuid.v1();
                        var msgContainerName = uuid.v1();

                        //Creating container in Azure Blob
                        storage.createContainer(photoContainerName);
                        storage.createContainer(msgContainerName);

                        const client = new Client({                       
                            userId: req.user._id,
                            name: req.body.name,
                            email: req.body.email,
                            city: req.body.city,
                            state: req.body.state,
                            country: req.body.country,
                            zip: parseInt(req.body.zip),
                            date: Date.parse(req.body.date),
                            photosContainer: photoContainerName,
                            msgContainer: msgContainerName
                        });

                        client.save(function(err, user) {
                            if(err) {
                                console.error(err);
                            } else {
                                console.log(user.name + " saved to clients collection");
                            }
                        });

                        res.redirect("/clients");
                    }
                }
            })
        } else {
            res.redirect("/login");
        }
    });   

    app.get("/clients/:id/delete", async function(req, res) {
        if(req.isAuthenticated()) {
            //Deleting all the messages
            Message.deleteMany({clientId: req.params.id}, function(err) {
                if(err) {
                    console.log("Error while deleting the messages for client " + req.params.id + ". Error: " + err);
                    //TODO: report error
                } else {
                    //Getting client information
                    console.log("Deleted all the messages send to the client " + req.params.id);

                    Client.find({_id: req.params.id}, function(err, client) {
                        if(err) {
                            console.log("Error while getting " + req.params.id + " client information. Error: " + err);
                            //TODO: report error
                        } else {
                            //Deleting photo container
                            storage.deleteContainer(client[0].photosContainer).then(() => {
                                console.log("Deleted photo container: " + client[0].photosContainer);

                                //Deleting message container
                                storage.deleteContainer(client[0].msgContainer).then(() => {
                                    console.log("Deleted message container: " + client[0].msgContainer);

                                    //Deleting client
                                    Client.deleteMany({_id: req.params.id}, function(err) {
                                        if(err) {
                                            console.log("Error while deleting client from database. Error: " + err);
                                        } else {
                                            console.log("Deleted client information from DB");
                                            res.redirect("/clients");
                                        }
                                    });
                                }).catch(error => {
                                    console.log("Error while deleting message container " + client[0].msgContainer + ". Error: " + error);
                                    //TODO: report error
                                });
                            }).catch(error => {
                                console.log("Error while deleting message container " + client[0].photosContainer + ". Error: " + error);
                                //TODO: report error
                            });
                        }
                    });
                }
            });

            //Delete container

        } else {
            res.redirect("/login");
        }
    });
}