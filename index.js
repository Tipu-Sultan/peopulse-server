
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./db/conn');
const postsRoutes = require('./routes/postsRoutes');
const authRoutes = require('./routes/authRoutes');
const followRoutes = require('./routes/followRoutes');
const chatsRoutes = require('./routes/chatsRoutes');
const storyRoutes = require('./routes/storyRoutes');


const app = express();

const cors = require('cors');
const path = require("path");


dotenv.config();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors())
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth/', authRoutes);
app.use('/api/post/', postsRoutes);
app.use('/api/follow/', followRoutes);
app.use('/api/chats/', chatsRoutes);
app.use('/api/story/', storyRoutes);

// Start the server
var server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('privateMessage', (savedMessage) => {
    io.to(savedMessage.roomId).emit('message', savedMessage);
  });

  socket.on('privateTyping', ({ roomId, isTyping, senderUsername }) => {
    socket.to(roomId).emit('isTyping', { isTyping, senderUsername });
  });
  



  socket.on('deletedMessage', ({ roomId, msgId }) => {
    socket.to(roomId).emit('deletedMessage', msgId);
  });



  // Typing events
  socket.on('addComment', (postIndex, commentData) => {
    io.emit('addComment', postIndex, commentData);
  });

  socket.on('deleteComment', (updatedPosts) => {
    io.emit('deleteComment', updatedPosts);
  });

  socket.on('handleLike', (updatedPosts) => {
    io.emit('handleLike', updatedPosts);
  });

  socket.on('deletePost', (updatedPosts) => {
    io.emit('deletePost', updatedPosts);
  });

  socket.on('addPost', (newPostData) => {
    io.emit('addPost', newPostData);
  });

  socket.on('addStory', (newStoryData) => {
    io.emit('addStory', newStoryData);
  });

  socket.on('follow-request', (followingbyreceiver, followedbySender, username, logginUser) => {
    io.emit('follow-request', followingbyreceiver, followedbySender, username, logginUser);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

