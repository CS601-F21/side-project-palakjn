const azureStorage = require("../utilities/storage");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const uuid = require('uuid');
const mailTransporter = require("../utilities/mailHandler");

var storage = multer.diskStorage(
    {
        destination: 'uploads/',
        filename: function ( req, file, cb ) {
            cb( null, uuid.v1() + path.extname(file.originalname));
        }
    }
);

var upload = multer( { storage: storage } );

uploadBlob = async function(containerName, file, directory) {
    await azureStorage.createBlob(containerName, file, directory);
    await unlinkFile(directory + "/" + file);
}

module.exports = function(app, Client, User, Message) {

    app.get("/:id/photos", function(req, res) {
        if (req.isAuthenticated()) {
            Client.find({_id: {$eq: req.params.id}}, function(err, client) {
                if(err) {
                    console.log(err);

                    res.render("photos", {
                        clientInfo: null,
                        photos: null,
                        googleUser: req.user.googleId ? true : false,
                        success: null,
                        failure: "Server error. Try again"
                    });
                } else {                    
                    //retrieve blobs from the container
                    var success = req.session.success;
                    var failure = req.session.failure;
                    req.session.success = null;
                    req.session.failure = null;

                    azureStorage.getBlobs(client[0].photosContainer).then(function(images) {
                        console.log("Got " + images.length + " images.");
                        
                        res.render("photos", {
                            clientInfo: client[0],
                            photos: images,
                            googleUser: req.user.googleId ? true : false,
                            success: success,
                            failure: failure
                        });
                    });                    
                }
            })
        } else {
            res.redirect("/login");
        }
    });

    app.post("/:id/photos", upload.array("uploads", 10), function(req, res) {
        if (req.isAuthenticated()) {  

            Client.find({_id: {$eq: req.params.id}}, function(err, client) {
                if(err) {
                    console.log(err);
                    req.session.success = null;
                    req.session.failure = "Server error. Try again later!";
                    res.redirect("/" + req.params.id + "/photos");
                } else {                    
                    //first saving photos in local

                    console.log("Uploading images to blob");
                    const uploadFolder = path.join(__dirname, "../uploads");

                    //upload them to the container
                    // Loop through all the files in the uploads directory
                    fs.readdir(uploadFolder, function (err, files) {
                        if (err) {
                            console.error("Could not list the directory.", err);
                            
                            req.session.success = null;
                            req.session.failure = "Server error. Try again later!";
                            res.redirect("/" + req.params.id + "/photos");
                        } else {
                            files.forEach(function (file, index) {
                                uploadBlob(client[0].photosContainer, file, uploadFolder);                         
                            });

                            req.session.success = "Uploading.....";
                            req.session.failure = null;
                            res.redirect("/" + req.params.id + "/photos");
                        }
                    });
                }
            });            
        } else {
            res.redirect("/login");
        }
    });

    app.get("/:id/photos/send", function(req, res) {
        if (req.isAuthenticated()) {

            Client.find({_id: {$eq: req.params.id}}, function(err, client) {
                if(err) {
                    console.log("Error while getting client information. Error:" + err);

                    req.session.success = null;
                    req.session.failure = "Server error. Try again later!";
                    res.redirect("/" + req.params.id + "/photos");
                } else {                    
                    //Create uniqueId
                    var uniqueId = uuid.v1();

                    //Create URL endpoint for client
                    let url = "http://localhost:3032/" + req.params.id + "/photos/" + uniqueId;
                    let shortUrl = "/" + req.params.id + "/photos/" + uniqueId;

                     //Update client table to add url
                     Client.findByIdAndUpdate({_id: req.params.id},{"sharedUrl": shortUrl}, function(err, result){
                        if(err){
                            console.log("Error while updating client information. Error:" + err);

                            req.session.success = null;
                            req.session.failure = "Server error. Try again later!";
                            res.redirect("/" + req.params.id + "/photos");
                        }
                        else{
                            console.log("Added shared url to the client " + req.params.id + " information.");

                            //Get user name from db
                            User.find({_id: {$eq: req.user._id}}, function(err, user) {
                                if(err) {
                                    console.log("Error while finding user information. Error:" + err);

                                    req.session.success = null;
                                    req.session.failure = "Server error. Try again later!";
                                    res.redirect("/" + req.params.id + "/photos");
                                } else {
                                    mailTransporter.sendMail(client[0].email, user[0].displayName, client[0].name, url).then((mailResponse) => {
                                        console.log(mailResponse);

                                        req.session.success = "Email Sent";
                                        req.session.failure = null;
                                        res.redirect("/" + req.params.id + "/photos");
                                    }).catch((error) => {
                                        console.log("Error while sending mail. Error: " + error);

                                        req.session.success = null;
                                        req.session.failure = "Error while sending mail!";
                                        res.redirect("/" + req.params.id + "/photos");
                                    });
                                }
                            });
                        }                            
                    });                    
                }
            });            
        } else {
            res.redirect("/login");
        }
    });

    app.get("/:clientId/photos/:id", function(req, res) {
        //Get Client information from DB
        Client.find({_id: {$eq: req.params.clientId}}, function(err, client) {

            //compare url where the client secret url 
            if("/".concat(req.params.clientId).concat("/photos/").concat(req.params.id) != client[0].sharedUrl) {
                 //if dont' match then, render a page showing a proper message
                console.log("URL doesn't match with " + client[0].sharedUrl);
                res.render("form", {
                    "photos" : null,
                    "message" : "This form is invalid. Ask the photographer to send you the new form.",
                    "successMessage" : null,
                    "url" : null
                })
            } else { //If match then,
                azureStorage.getBlobs(client[0].photosContainer).then(function(images) {
                    console.log("Got " + images.length + " images.");

                    res.render("form", {
                        "photos" : images,
                        "message" : null,
                        "successMessage" : null,
                        "url" : "/".concat(req.params.clientId).concat("/photos/").concat(req.params.id)
                    });
                });
            }
        });
    });

    app.post("/:clientId/photos/:id", function(req, res) {
        Client.find({_id: {$eq: req.params.clientId}}, function(err, client) {
            //Get the list of photos which user has selected
            let photos = req.body.checkbox;  

            const uploadFolder = path.join(__dirname, "../selected");

            var fileName = req.params.id + ".txt";
            let isSuccess = true;

            if(Array.isArray(photos)) {
                //Multiple photos 
                
                //Creating a local file and storing all the selected photos URLs there.
                photos.forEach(photo => {                
                    try {
                        fs.appendFileSync(path.join(uploadFolder, fileName), photo.slice(0, -1).concat("\r\n"), 'utf8');
                    } catch (err) {
                        console.log("Error while appending line " + photo + " to the file. " + err);
                        isSuccess = false;
                    }
                });
                
            } else {
                //Single photo 
                try {
                    fs.appendFileSync(path.join(uploadFolder, fileName), photos.slice(0, -1).concat("\r\n"), 'utf8');
                } catch (err2) {
                    console.log("Error while appending line " + photos + " to the file. " + err2);
                    isSuccess = false;
                }
            }            

            if(isSuccess) {
                //Uploading the file to storage
                uploadBlob(client[0].msgContainer, fileName, uploadFolder).then(function() {

                    //Add new message to Message schema
                    const message = new Message({  
                        userId: client[0].userId,
                        clientId: req.params.clientId,
                        read: false,
                        fileName: fileName
                    });

                    message.save(function(err) {
                        if(err) {
                            console.error(err);
                        } else {
                            console.log("New message added to the collection for the client " + req.params.clientId);
                        }
                    });

                    //Update client table to remove shared url
                    Client.findByIdAndUpdate({_id: req.params.clientId},{"sharedUrl": null}, function(err1){
                        if(err1){
                            //TODO: Handle the error
                            console.log(err1);
                        }
                        else{
                            console.log("Removed shared url from the client " + req.params.clientId + " information.");
                        }                            
                    });

                    res.render("form", {
                        "photos" : null,
                        "message" : null,
                        "successMessage" : "Thanks for your input. Form Submitted!",
                        "url" : null
                    });
                });      
            } else {
                //Redirecting back to display all the images to let client to choose photos again because of internal error
                //TODO: Display error message in user to let them know to choose again.
                res.redirect("/" + req.params.clientId + "/photos/" + req.params.id);
            }
        });
    });
}