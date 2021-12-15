const storage = require("../utilities/storage");
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const zip = require("../utilities/zipHandler");

module.exports = function(app, Client, Message) {
    
    /**
     * Handles GET request for the route /messages/unread to display unread messages in UI
     */
    app.get("/messages/unread", async function(req, res) {
        if (req.isAuthenticated()) {            
            var messages = [];

            var msgs = await Message.find({read: false, userId: req.user._id});

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
                "messages": messages,
                googleUser: req.user.googleId ? true : false
            })
        } else {
            res.redirect("/login");
        }
    });

    /**
     * Handles GET request for the route /messages/read to display read messages in UI
     */
    app.get("/messages/read", async function(req, res) {
        if (req.isAuthenticated()) {            
            var messages = [];

            var msgs = await Message.find({read: true, userId: req.user._id});

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
                "messages": messages,
                googleUser: req.user.googleId ? true : false
            })
        } else {
            res.redirect("/login");
        }
    });

    /**
     * Handles GET request for the route /messages/:id to display particular message in UI
     */
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

                    storage.downloadBlobToFile(client.msgContainer, uploadFolder, msg.fileName).then(async function() {

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
                                "id": req.params.id,
                                "name": client.name,
                                "email": client.email,
                                "photos": photos
                            },
                            googleUser: req.user.googleId ? true : false
                        });
                    });                    
                }
            }           
            
        } else {
            res.redirect("/login");
        }
    });

    /**
     * Handles GET request for the route /messages/:id/download to download the images seletected by the client. 
     * Will first create the zip having all the files and will download it.
     */
    app.get("/messages/:id/download", async function(req, res) {
        if(req.isAuthenticated()) {
            const uploadFolder = path.join(__dirname, "../selected");
            var photos = [];

            var msgs = await Message.find({_id: {$eq: req.params.id}});

            if(msgs.length == 1) {
                var msg = msgs[0];
                var clients = await Client.find({_id: {$eq: msg.clientId}});

                if(clients.length == 1) {
                    var client = clients[0];
                    const zipFilePath = path.join(__dirname, "../selected", client.name + ".zip");

                    storage.downloadBlobToFile(client.msgContainer, uploadFolder, msg.fileName).then(async function() {

                        const allFileContents = fs.readFileSync(uploadFolder + "/" + msg.fileName, 'utf-8');
                        allFileContents.split(/\r?\n/).forEach(line =>  {
                            if(line) {
                                photos.push(line);
                            }
                        });

                        await unlinkFile(uploadFolder + "/" + msg.fileName);                      
                        
                        await zip.createZip(zipFilePath, client.photosContainer, photos);
                        
                        res.download(zipFilePath, async function(error){
                            if(error) {
                                console.log("Error while downloading content: ", error)
                            } else {
                                console.log("File is downloaded successfully. Deleting the file.");                              
                                await unlinkFile(zipFilePath);
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