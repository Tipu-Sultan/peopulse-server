const Friends = require('../models/friends');
const User = require('../models/users');

async function makeFollowRequest(req, res) {
  const { senderUsername, receiverUsername, action } = req.body;

  try {
    // Check if the sender and receiver exist
    const sender = await User.findOne({ username: senderUsername }).select('-password -otp -token');
    const receiver = await User.findOne({ username: receiverUsername }).select('-password -otp -token');

    if (action === 'Cancel') {
      await Friends.findOneAndDelete({
        senderUsername: sender.username,
        receiverUsername: receiver.username,
      });

      // Delete from sender's & receiver  array
      sender.following = sender.following.filter(
        (follow) =>
          !(follow.followingUsername === receiver.username)
      );

      receiver.followers = receiver.followers.filter(
        (follower) =>
          !(follower.followersUsername === sender.username)
      );

    } else if (action === 'Delete') {

      await Friends.findOneAndDelete({
        $or: [
          {
            senderUsername: receiver.username,
            receiverUsername: sender.username,
          },
          {
            senderUsername: sender.username,
            receiverUsername: receiver.username,
          }
        ]
      });

      sender.following = sender.following.filter(
        (follow) =>
          !(follow.followingUsername === receiver.username && follow.logginUsername === sender.username)
      );

      receiver.followers = receiver.followers.filter(
        (follower) =>
          !(follower.followersUsername === sender.username && follower.logginUsername === receiver.username)
      );

      // Delete from sender's & receiver  array
      receiver.following = sender.following.filter(
        (follow) =>
          !(follow.followingUsername === receiver.username && follow.logginUsername === sender.username)
      );

      sender.followers = receiver.followers.filter(
        (follower) =>
          !(follower.followersUsername === sender.username && follower.logginUsername === receiver.username)
      );

    }
    else if (action === 'Requested') {

      // Find the existing relationship in Friends collection
      const existingRelationship = await Friends.findOne({
        senderUsername: sender.username,
        receiverUsername: receiver.username,
      });

      // If the relationship doesn't exist, insert new data
      if (!existingRelationship) {
        const newRelationship = new Friends({
          senderUsername: sender.username,
          receiverUsername: receiver.username,
          status: 'pending',
          action: action,
        });
        await newRelationship.save();

        sender.following.push({
          followingUsername: receiver.username,
          logginUsername: sender.username,
          status: 'pending',
          action: action,
        });

        receiver.followers.push({
          followersUsername: sender.username,
          logginUsername: receiver.username,
          status: 'pending',
          action: action,
        });
      }

    } else if (action === 'Following') {

      const existingRelationship = await Friends.findOne({
        senderUsername: receiver.username,
        receiverUsername: sender.username,
      });

      // Update the status and action in Friends collection
      if (existingRelationship) {
        existingRelationship.status = 'confirmed';
        existingRelationship.action = action;
        await existingRelationship.save();
      }

      // Update the status and action in sender's following array
      const senderFollowing = receiver.following.find((follow) => follow.followingUsername === sender.username);
      if (senderFollowing) {
        senderFollowing.status = 'confirmed';
        senderFollowing.action = action;
      }

      // Update the status and action in receiver's followers array
      const receiverFollower = sender.followers.find((follow) => follow.followersUsername === receiver.username);
      if (receiverFollower) {
        receiverFollower.status = 'confirmed';
        receiverFollower.action = action;
      }
    }

    const followedbySender = await sender.save();
    const followingbyreceiver = await receiver.save();
    res.status(201).json({ message: `Follow request ${action} successfully.`, followedbySender, followingbyreceiver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function updateBlockUnblock(req, res) {
  try {
    const { To, blockStatus } = req.body;

    // Construct the query to find the user by username
    const query = { username: To };

    // Update the blockStatus field
    const updateResult = await User.findOneAndUpdate(
      query,
      { blockStatus: blockStatus },
      { new: true }
    );

    if (updateResult) {
      res.status(200).json({ message: 'Block status updated successfully', data: updateResult });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating block status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


module.exports = {
  makeFollowRequest,
  updateBlockUnblock
};
