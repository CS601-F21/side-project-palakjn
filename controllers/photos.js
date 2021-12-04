require('dotenv').config();
const storage = require("../utilities/storage");
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const uuid = require('uuid');
const mailTransporter = require("../utilities/mailHandler");

upload = async function(containerName, file, directory) {
    await storage.createBlob(containerName, file, directory);
    await unlinkFile(directory + "/" + file);
}

module.exports = function(app, Client, User) {

    app.get("/:id/photos", function(req, res) {
        if (req.isAuthenticated()) {
            Client.find({_id: {$eq: req.params.id}}, function(err, client) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {                    
                    //retrieve blobs from the container

                    (async function(){
                        let images = await storage.getBlobs(client[0].container);
                        res.render("photos", {
                            clientInfo: client[0],
                            photos: images
                        });
                    })();
                    
                }
            })
        } else {
            res.redirect("/login");
        }
    });

    app.post("/:id/photos", function(req, res) {
        if (req.isAuthenticated()) {   
            Client.find({_id: {$eq: req.params.id}}, function(err, client) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {                    
                    //first saving photos in local

                    const uploadFolder = path.join(__dirname, "uploads");

                    var form = new formidable.IncomingForm();
                    form.multiples = true;
                    form.uploadDir = uploadFolder;

                    form.on('fileBegin', function (name, file) {
                        file.filepath = path.join(uploadFolder, file.originalFilename); 
                    })

                    form.parse(req); 

                    form.on('file', function (name, file) {
                        console.log("Downloaded file " + file.originalFilename + " in location " + uploadFolder);
                    });

                    form.on('end', () => {
                        //upload them to the container
                        // Loop through all the files in the uploads directory
                        fs.readdir(uploadFolder, function (err, files) {
                            if (err) {
                                //TODO: handle error
                                console.error("Could not list the directory.", err);
                            } else {
                                files.forEach(function (file, index) {
                                    upload(client[0].container, file, uploadFolder);                         
                                });
                            }
                        });
                    });
                }
            })

            res.redirect("/" + req.params.id + "/photos");
        } else {
            res.redirect("/login");
        }
    });

    app.get("/:id/photos/send", function(req, res) {
        if (req.isAuthenticated()) {
            Client.find({_id: {$eq: req.params.id}}, function(err, client) {
                if(err) {
                    //TODO: handle error
                    console.log(err);
                } else {                    
                    //Create uniqueId
                    var uniqueId = uuid.v1();

                    //Create URL endpoint for client
                    let url = "http://localhost:3032/" + req.params.id + "/photos/" + uniqueId;
                    let shortUrl = req.params.id + "/photos/" + uniqueId;

                     //Update client table to add url
                     Client.findByIdAndUpdate({_id: req.params.id},{"sharedUrl": shortUrl}, function(err, result){
                        if(err){
                            res.send(err)
                        }
                        else{
                            console.log("Added shared url to the client " + req.params.id + " row. " + result);
                        }                            
                    });

                    //Get user name from storage
                    User.find({_id: {$eq: req.user._id}}, function(err1, user) {
                        if(err1) {
                            //TODO: handle error
                            console.log(err1);
                        } else {
                            mailTransporter.sendMail(client[0].email, user[0].displayName, client[0].name, url);
                        }
                    });
                }
            });
            
            res.redirect("/" + req.params.id + "/photos");
        } else {
            res.redirect("/login");
        }
    });
}