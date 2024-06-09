const Group = require('../models/chatGroup');
const User = require('../models/users');

// Endpoint to create a group
const createChatsGroup = ('/create-group', async (req, res) => {
    const { groupName, adminUsername, memberUsernames, groupProfileImage } = req.body;
  
    try {
      const admin = await User.findOne({ username: adminUsername });
  
      if (!admin) {
        return res.status(404).json({ message: 'Admin user not found' });
      }
  
      const members = await User.find({ username: { $in: memberUsernames } });

  
      const newGroup = new Group({
        groupName,
        admin: admin.username,
        members: memberUsernames,
        groupProfileImage,
      });
  
      const savedGroup = await newGroup.save();
  
      // Optionally, add the group reference to the user's groups array
      admin.groups.push(savedGroup.username);
      await admin.save();
  
      members.forEach(async (member) => {
        member.groups.push(savedGroup.username);
        await member.save();
      });
  
      res.status(201).json(savedGroup);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports = {
    createChatsGroup
};
