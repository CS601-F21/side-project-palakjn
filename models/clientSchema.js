const mongoose = require('mongoose');

exports.getClientSchema = function() {
    
  const clientSchema = new mongoose.Schema ({
    photosContainer: String,
    userId: String,
    name: String,
    email: String,
    city: String,
    state: String,
    country: String,
    zip: { type: Number },
    date: { type: Date, default: Date.now },
    sharedUrl: String,
    msgContainer: String
  });
  
  return clientSchema;
};