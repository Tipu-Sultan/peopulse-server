const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const { Signup, getUserDetails, Login, ForgotPassword, ResetPassword, activateAuthUser, deleteAuthAccount, getAllUserDetails, getOtherDetails, editUserDetails, Logout } = require("../controller/AuthController");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // You need to create the 'uploads' directory in your project
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
});

const upload = multer({ storage: storage });
router.put('/saveprofile',upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),editUserDetails);


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
