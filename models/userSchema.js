const mongoose = require('mongoose');

exports.getUserSchema = function() {
    
  const userSchema = new mongoose.Schema ({
    fname: String,
    lname: String,
    email: String,
    password: String,
    googleId: String,
    displayName: String
  });
  
  return userSchema;
};