const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = require("../models/userSchema");
const clientSchema = require("../models/clientSchema");
const messageSchema = require("../models/messageSchema");

exports.initDB = function() {
    mongoose.connect("mongodb://" + process.env.DB_HOST + "/easyShare", {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(()=>{
        console.log(`connection to database established`)
    }).catch(err=>{
        console.log(`db error ${err.message}`);
        process.exit(-1)
    });
}

exports.createUserCollection = function() {
    const user = userSchema.getUserSchema();
    user.plugin(passportLocalMongoose);
    user.plugin(findOrCreate);

    return new mongoose.model("User", user);
}

exports.createClientCollection = function() {
    const client = clientSchema.getClientSchema();

    return mongoose.model("Client", client);
}

exports.createMessageCollection = function() {
    const message = messageSchema.getMessageSchema();

    return mongoose.model("Message", message);
}