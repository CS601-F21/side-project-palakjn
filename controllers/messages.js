
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
}