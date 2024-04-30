const mongoose = require('mongoose');

const friendsSchema = new mongoose.Schema({
    senderUsername: {
        type: String,
        required: true,
    },
    receiverUsername: {
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
    senderActionTimestamp: {
        type: Date,
        default: Date.now,
    },
    receiverActionTimestamp: {
        type: Date,
    },
}, { timestamps: true });

const Friends = mongoose.model('Friends', friendsSchema);

module.exports = Friends;
