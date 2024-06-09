const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true,
  },
  admin: {
    type: String, // Assuming username is of String type
    ref: 'User', // Reference to the User model
    required: true,
  },
  members: [{
    type: String, 
    ref: 'User', 
    required: true,
  }],
  groupProfileImage: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
