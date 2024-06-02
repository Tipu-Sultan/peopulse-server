
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require("path");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./db/conn');
const postsRoutes = require('./routes/postsRoutes');
const authRoutes = require('./routes/authRoutes');
const followRoutes = require('./routes/followRoutes');
const chatsRoutes = require('./routes/chatsRoutes');
const storyRoutes = require('./routes/storyRoutes');


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


dotenv.config();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors())
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send("Hello World");
});

// Routes
app.use('/api/auth/', authRoutes);
app.use('/api/post/', postsRoutes);
app.use('/api/follow/', followRoutes);
app.use('/api/chats/', chatsRoutes);
app.use('/api/story/', storyRoutes);

// Start the server

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  // socket.on('joinRoom', ({ sender, receiver }) => {
  //   const roomId = [sender, receiver].sort().join('_');
  //   socket.join(sender);
  //   socket.username = sender;
  // });

  socket.on('CallToRegisterUser', ({ sender, receiver }) => {
    const roomId = [sender, receiver].sort().join('_');
    socket.join(sender);
    socket.username = sender;
  });

  socket.on('callUser', (data) => {
    const { userToCall, signalData, from } = data;
    io.to(userToCall).emit('call-made', { signal: signalData, from });
  });

  socket.on('answerCall', (data) => {
    const { to, signal } = data;
    io.to(to).emit('call-answered', { signal });
  });

  socket.on('declineCall', ({ to }) => {
    io.to(to).emit('callDeclined');
  });

  socket.on('call-end', ({ to }) => {
    io.to(to).emit('call-ended');
  });


  socket.on('privateMessage', (savedMessage) => {
    const socketId = savedMessage.receiverUsername;
    io.to(socketId).emit('message', savedMessage);
  });

  socket.on('privateTyping', ({isTyping, reciverUsername }) => {
    io.to(reciverUsername).emit('isTyping', { isTyping, reciverUsername });
  });


  socket.on('deletedMessage', ({ roomId, msgId }) => {
    io.to(roomId).emit('deletedMessage', msgId);
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
    io.emit('storyAdded', newStoryData);
  });

  socket.on('deleteStory', (newStoryData) => {
    io.emit('storyDeleted', newStoryData);
  });

  socket.on('follow-request', (followingbyreceiver, followedbySender, username, logginUser) => {
    io.emit('follow-request', followingbyreceiver, followedbySender, username, logginUser);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

