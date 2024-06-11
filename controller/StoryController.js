const Story = require('../models/story')
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.MY_CLOUD_NAME,
    api_key: process.env.MY_API_KEY,
    api_secret: process.env.MY_API_SECRET
});


async function storeStories(req, res) {
  try {
      const { username, profileImage, contentType, text } = req.body;
      let content = '';

      if (contentType === 'text') {
          content = text;
          const SaveStory = new Story({
              username,
              profileImage: profileImage!='' ?profileImage : username,
              contentType,
              content
          });
          const newStory = await SaveStory.save();
          return res.status(201).json(newStory);
      } else {
          try {
              if (!req.file) {
                  return res.status(400).json({ msg: "No file uploaded." });
              }
              if (req.file.size > 5 * 1024 * 1024) {
                  return res.status(400).json({ msg: "File size exceeds the limit of 5MB." });
              }
              cloudinary.uploader.upload_stream({ resource_type: "auto" }, async (error, result) => {
                  if (error) {
                      console.error('Error uploading file to Cloudinary:', error);
                      return res.status(500).json({ error: 'Error uploading file to Cloudinary.' });
                  }
                  const SaveStory = new Story({
                      username,
                      profileImage: profileImage!='' ?profileImage : username,
                      contentType,
                      content: result.secure_url
                  });
                  const newStory = await SaveStory.save();
                  return res.status(201).json(newStory);
              }).end(req.file.buffer);
          } catch (err) {
              console.error("Error saving file details to MongoDB:", err);
              return res.status(500).json({ error: "Error saving file details to MongoDB." });
          }
      }
  } catch (error) {
      console.error('Error storing story:', error);
      res.status(500).json({ error: 'Failed to store story' }); // Send an error response
  }
}


const deleteStory = async (req, res) => {
  const { _id } = req.params;

  try {
    // Find the story by ID and delete it
    const deletedStory = await Story.findByIdAndDelete(_id);

    if (!deletedStory) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function getAllStories(req, res) {
  try {
    // Calculate the date 24 hours ago from now
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Delete stories older than 24 hours
    const deleteResult = await Story.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
    console.log(`Deleted ${deleteResult.deletedCount} stories older than 24 hours`);

    // Retrieve all remaining stories from the database
    const stories = await Story.find();
    res.json(stories); // Send the stories as a response
  } catch (error) {
    console.error('Error retrieving stories:', error);
    res.status(500).json({ message: 'Failed to retrieve stories' }); // Send an error response
  }
}

module.exports = {
  storeStories,
  getAllStories,
  deleteStory,
}