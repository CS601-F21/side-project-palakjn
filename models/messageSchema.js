const mongoose = require('mongoose');

exports.getMessageSchema = function() {
    
  const clientSchema = new mongoose.Schema ({
    userId: String,
    clientId: String,
    read: { type: Boolean, default: false },
    fileName: String
  });
  
  return clientSchema;
};