const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    ref: 'User',
    required: true,
    default: '',
  },
  profileImage: {
    type: String, 
    default: '',
  },
  content: {
    type: String, 
  },
  contentType: {
    type: String, 
    required: true,
  },
  media: {
    type: String, 
  },
  likes: [
    {
      user: {
        type: String,
        required: true,
        default: '',
      },
      status: {
        type: String,
        required: true,
        default: '',
      },
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      profileImage:{
        type: String,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
