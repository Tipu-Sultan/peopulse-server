const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1); // Exit the process with an error
  }
};

module.exports = connectDB;
