const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createChatsGroup } = require("../controller/GroupChatController");
const router = express.Router();


router.post('/create-group',authMiddleware,createChatsGroup);



module.exports = router;
