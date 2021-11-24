const dbManager = require("./dbManager");
const storage = require("./storage");
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const uuid = require('uuid');

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

    app.get("/:id/photos", function(req, res) {
        if (req.isAuthenticated()) {
            Client.find({_id: {$eq: req.params.id}}, function(err, client) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {
                    res.render("photos", {
                        clientInfo: client[0]
                    });
                }
            })
        } else {
            res.redirect("/login");
        }
    });

    app.post("/upload", function(req, res) {
        if (req.isAuthenticated()) {    

            var form = new formidable.IncomingForm();

            const uploadFolder = path.join(__dirname, "uploads");
            form.multiples = true;
            form.uploadDir = uploadFolder;

            form.on('fileBegin', function (name, file) {
                file.filepath = path.join(uploadFolder, file.originalFilename); 
            })

            form.parse(req, async function (err, fields, files) {
                if(err) {
                    console.log(err);
                }
                else {                    
                    console.log(files);
                }
              });            
            
            // form.parse(req);            

            // form.on('file', function (name, file) {
            //     console.log("Uploaded file " + file.originalFilename);
            // })

            res.redirect("/clients");
        } else {
            res.redirect("/login");
        }
    });
}