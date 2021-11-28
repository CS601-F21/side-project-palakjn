const storage = require("./storage");
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

upload = async function(containerName, file, directory) {
    await storage.createBlob(containerName, file, directory);
    await unlinkFile(directory + "/" + file);
}

module.exports = function(app, Client) {

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

    app.post("/:id/upload", function(req, res) {
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

                     //Delete the items from "uploads" folder

                    res.redirect("/" + req.params.id + "/photos");
                }
            })
        } else {
            res.redirect("/login");
        }
    });
}