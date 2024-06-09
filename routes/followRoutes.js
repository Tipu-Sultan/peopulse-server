const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {makeFollowRequest,updateBlockUnblock } = require("../controller/FollowController");



router.post('/follow-reuqest', authMiddleware,makeFollowRequest);
router.put('/update-block-unbock', authMiddleware,updateBlockUnblock);

module.exports = router;

