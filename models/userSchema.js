const mongoose = require('mongoose');

exports.getUserSchema = function() {
    
  const userSchema = new mongoose.Schema ({
    fname: String,
    lname: String,
    email: String,
    password: String,
    googleId: String,
    displayName: String,    
    address: String,
    city: String,
    state: String,
    country: String,
    phone: String,
  });
  
  return userSchema;
};