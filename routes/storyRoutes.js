const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const { storeStories, getAllStories, deleteStory } = require("../controller/StoryController");
const router = express.Router();
require('dotenv').config();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4','audio/mp3'];
  if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
  } else {
      cb(new Error("Only image, video, and audio files are allowed."), false);
  }
};

const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
});


router.post('/store-story',authMiddleware, upload.single('file'),storeStories);
router.get('/get-stories', getAllStories);
router.delete('/delete-story/:_id', deleteStory);



module.exports = router;
  