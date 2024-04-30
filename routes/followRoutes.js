const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {makeFollowRequest } = require("../controller/FollowController");



router.post('/follow-reuqest', authMiddleware,makeFollowRequest);

module.exports = router;

