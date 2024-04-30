const express = require("express");
const multer = require("multer");
const { addPost, likePost, getAllPost,addCommentOnPost, deleteComment, deletePost} = require("../controller/PostController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

require('dotenv').config();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpg','image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/mp4','audio/mp3'];
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


router.post("/addpost",authMiddleware, upload.single("file"), addPost);

router.post("/like/:postId",authMiddleware,likePost);

router.post("/add-comment/:postId", authMiddleware,addCommentOnPost);

router.delete("/delete-comment/:postId/:cmtId", authMiddleware,deleteComment);

router.delete("/delete-post/:postId", authMiddleware,deletePost);


router.get("/getposts",authMiddleware,getAllPost);





module.exports = router;
