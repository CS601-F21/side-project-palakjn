const storage = require("../utilities/storage");
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

module.exports = function(app, Client, Message) {
    
    app.get("/messages/unread", async function(req, res) {
        if (req.isAuthenticated()) {            
            var messages = [];

            var msgs = await Message.find({read: false});

            if(msgs.length > 0) {
                console.log("Got " + msgs.length + " messages");

                for(var index in msgs) {
                    var clients = await Client.find({_id: {$eq: msgs[index].clientId}});

                    if(clients.length == 1) {
                        messages.push({
                            "id": msgs[index]._id,
                            "clientName": clients[0].name,
                            "email": clients[0].email
                        }); 
                    }
                }
            }

            res.render("messages", {
                "read": false,
                "messages": messages
            })
        } else {
            res.redirect("/login");
        }
    });

    app.get("/messages/read", async function(req, res) {
        if (req.isAuthenticated()) {            
            var messages = [];

            var msgs = await Message.find({read: true});

            if(msgs.length > 0) {
                console.log("Got " + msgs.length + " messages");

                for(var index in msgs) {
                    var clients = await Client.find({_id: {$eq: msgs[index].clientId}});

                    if(clients.length == 1) {
                        messages.push({
                            "id": msgs[index]._id,
                            "clientName": clients[0].name,
                            "email": clients[0].email
                        }); 
                    }
                }
            }

            res.render("messages", {
                "read": true,
                "messages": messages
            })
        } else {
            res.redirect("/login");
        }
    });

    app.get("/messages/:id", async function(req, res) {
        if(req.isAuthenticated()) {
            const uploadFolder = path.join(__dirname, "../selected");
            var photos = [];

            var msgs = await Message.find({_id: {$eq: req.params.id}});

            if(msgs.length == 1) {
                var msg = msgs[0];
                var clients = await Client.find({_id: {$eq: msg.clientId}});

                if(clients.length == 1) {
                    var client = clients[0];

                    console.log("Client information found. " + client.msgContainer + " fileName: " + msg.fileName);
                    storage.downloadBlob(client.msgContainer, uploadFolder, msg.fileName).then(async function() {

                        const allFileContents = fs.readFileSync(uploadFolder + "/" + msg.fileName, 'utf-8');
                        allFileContents.split(/\r?\n/).forEach(line =>  {
                            if(line) {
                                photos.push(line);
                            }
                        });

                        await unlinkFile(uploadFolder + "/" + msg.fileName);

                        await Message.findByIdAndUpdate({_id: req.params.id}, {"read": true});
                        
                        res.render("message", {
                            "message": {
                                "name": client.name,
                                "email": client.email,
                                "photos": photos
                            }
                        });
                    });                    
                }
            }           
            
        } else {
            res.redirect("/login");
        }
    });
}