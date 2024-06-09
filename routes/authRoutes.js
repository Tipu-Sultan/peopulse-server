const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const { Signup, getUserDetails, Login, ForgotPassword, ResetPassword, activateAuthUser, deleteAuthAccount, getAllUserDetails, getOtherDetails, editUserDetails, Logout } = require("../controller/AuthController");

require('dotenv').config();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif','image/webp'];
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

router.put('/saveprofile',authMiddleware,upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),editUserDetails);


router.post("/signup",Signup);

router.post('/login',Login);

router.post('/logout',authMiddleware,Logout);

router.post('/forgot-password',ForgotPassword);

router.post('/reset-password',ResetPassword);

router.put('/activate-user/:token',activateAuthUser);

router.delete('/delete-user/:userId',authMiddleware,deleteAuthAccount);

router.get('/user-details', authMiddleware,getUserDetails);

router.get('/user-details/:username', authMiddleware,getOtherDetails);

router.get('/get-users', authMiddleware,getAllUserDetails);


module.exports = router;
