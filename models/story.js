const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  username: { 
    type: String,
    required: true
  },
  profileImage: { 
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['image', 'video', 'gif', 'text','audio'],
    required: true
  },
  content: { 
    type: String,
    required: true
  },
  createdAt: { 
    type: Date,
    default: Date.now,
    required: true
  },
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
