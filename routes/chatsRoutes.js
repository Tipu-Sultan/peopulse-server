const express = require("express");
const multer = require("multer");
const { storeChats, getFollowedUsers, getSenderRecievrMsg, deleteMsgById, getAllMessags,deleteMultiMsgById } = require("../controller/ChatsController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const path = require('path');

// Set up storage for multer
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

router.post('/',authMiddleware,upload.single("file"),storeChats);
router.get('/followed-user-details/:username',authMiddleware,getFollowedUsers);
router.post('/get-messages',authMiddleware,getSenderRecievrMsg);
router.get('/get-allmessages',authMiddleware,getAllMessags);
router.delete('/delete-message/:msgId',authMiddleware,deleteMsgById);
router.delete('/delete-multi-messages',authMiddleware,deleteMultiMsgById);


module.exports = router;
