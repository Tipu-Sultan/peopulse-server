const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  bio: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  lastMessage: {
    type: String,
    default: '',
  },
  lastSeen: {
    type: Number,
    default: Date.now,
  },
  blockStatus: {
    type: String,
    default: '',
},
  followers: [
    {
      followersUsername: {
        type: String,
        required: true,
      },
      logginUsername: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'confirmed'],
        default: 'pending',
      },
      action: {
        type: String,
        enum: ['Requested', 'Follow', 'Following'],
        required: true,
      },
    }
  ],
  following: [
    {
      followingUsername: {
        type: String,
        required: true,
      },
      logginUsername: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'confirmed'],
        default: 'pending',
      },
      action: {
        type: String,
        enum: ['Requested', 'Following'],
        required: true,
      },
    }
  ],
  token: {
    type: String,
    default: '',
  },
  otp: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  isLogged: {
    type: Boolean,
    default: false,
  },
  access: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    }
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
