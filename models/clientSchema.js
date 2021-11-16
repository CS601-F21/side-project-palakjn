const mongoose = require('mongoose');

exports.getClientSchema = function() {
    
  const clientSchema = new mongoose.Schema ({
    userId: String,
    name: String,
    url: String
  });
  
  return clientSchema;
};