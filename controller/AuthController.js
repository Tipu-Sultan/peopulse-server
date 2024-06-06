const dotenv = require('dotenv');
dotenv.config();
const User = require("../models/users");
const path = require('path');
const fs = require('fs');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const SECRET_KEY = process.env.SECRET_KEY;
const API_HOST = process.env.API_HOST;
const { isValidEmail, isValidPhoneNumber, isStrongPassword, generateVerificationToken } = require("../services/validation");
const { sendVerificationEmail } = require("../services/sendmail");
const client = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
const { v4: uuidv4 } = require('uuid');
const Post = require('../models/posts');
const Story = require('../models/story');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.MY_CLOUD_NAME,
  api_key: process.env.MY_API_KEY,
  api_secret: process.env.MY_API_SECRET
});

async function Signup(req, res) {
  try {
    const { firstname, lastname, username, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one symbol, and one digit.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateVerificationToken();

    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      phoneNumber,
      token: verificationToken,
      status: 'inactive',
      access: 'user',
      password: hashedPassword,
    });

    await newUser.save();

    const subject = "Account Verification Email";
    const verificationLink = `${API_HOST}/activation/${verificationToken}`;
    const message = `Click the following link to verify your account: ${verificationLink}`;

    await sendVerificationEmail(email, subject, message);

    res.status(201).json({ message: "User created successfully. Verification email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


async function Login(req, res) {
  try {
    const { userInput, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: userInput },
        { username: userInput },
        { phoneNumber: userInput },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is not active' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.isLogged = true;
    await user.save();

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(payload, SECRET_KEY, { expiresIn: '5h' }, (error, token) => {
      if (error) throw error;
      res.status(200).json({ token, message: 'Logged In' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const Logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the current timestamp
    const currLastSeen = Date.now();

    // Update the user's document with the new lastSeen time
    await User.findByIdAndUpdate(userId, { isLogged: false, lastSeen: currLastSeen });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout. Please try again.' });
  }
};




async function getUserDetails(req, res) {
  try {
    // Assuming authenticateToken middleware sets user ID in req.user.id
    const userId = req.user.id;

    // Fetch user details from the database using the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Exclude sensitive information like the password before sending it to the frontend
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch user details', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


async function ForgotPassword(req, res) {
  const { userValue } = req.body;

  try {
    let query;
    if (isValidEmail(userValue)) {
      query = { email: userValue };
    } else if (isValidPhoneNumber(userValue)) {
      query = { phoneNumber: userValue };
    } else {
      return res.status(400).json({ error: "Invalid email or number input" });
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otpToken = generateVerificationToken();

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: { otp: otpToken } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "OTP not UPDATED or Send" });
    }

    if (isValidEmail(userValue)) {
      const msg = "An OTP sent to " + userValue;
      const subject = "OTP Request Email";
      const message = `Your OTP IS : ${otpToken}`;

      await sendVerificationEmail(userValue, subject, message);
      res.status(201).json({ message: `${msg}` });
    } else if (isValidPhoneNumber(userValue)) {

      client.messages
        .create({
          body: `Hi, ${user.firstname} Your OTP is: ${otpToken} , do not share to any one, Thank You.`,
          from: "+12562911993",
          to: "+91" + userValue,
        })
        .then(() => {
          res.status(201).json({ message: `OTP sent to your number` });
        })
        .catch((error) => {
          console.error("Error sending OTP to phone:", error);
          res.status(500).json({ error: "Error sending OTP to phone" });
        });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function ResetPassword(req, res) {
  const { password, cpassword, otp } = req.body;

  if (password !== cpassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {

    const hashedPassword = await bcrypt.hash(cpassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { otp },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Invalid OTP" });
    }

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function activateAuthUser(req, res) {
  const { token } = req.params;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { token },
      { $set: { status: "active" } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: `Hi ${updatedUser.firstname} your A/c activated successfully`,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(500)
      .json({ message: "An error occurred while activating the user" });
  }
}

async function deleteAuthAccount(req, res) {
  const { userId } = req.params;

  try {

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'inactive' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully', user: updatedUser });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllUserDetails(req, res) {
  try {
    const users = await User.find({}, { password: 0, token: 0, otp: 0 });

    res.json(users);
  } catch (error) {
    console.error('Failed to fetch user details', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getOtherDetails(req, res) {
  try {
    // Assuming authenticateToken middleware sets user ID in req.user.id
    const { username } = req.params;

    // Fetch user details from the database using the user ID
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Exclude sensitive information like the password before sending it to the frontend
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to fetch user details', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


async function editUserDetails(req, res) {
  try {
    // Retrieve user data from the request body
    const { username, firstname, lastname, email, bio } = req.body;

    // Handle file uploads (avatar and coverImage)
    const avatarFile = req.files && req.files['avatar'] ? req.files['avatar'][0] : null;
    const coverImageFile = req.files && req.files['coverImage'] ? req.files['coverImage'][0] : null;

    // Save the edited user data to the database or perform any other necessary actions
    const editedUser = {
      username,
      firstname,
      lastname,
      email,
      bio,
    };

    // Update the file paths in the editedUser object
    if (avatarFile) {

      cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
        if (error) {
          console.error('Error uploading file to Cloudinary:', error);
          return res.status(500).json({ error: 'Error uploading file to Cloudinary.' });
        }
        const updateprofileImageUrl = await User.findOne({email:email});
        updateprofileImageUrl.profileImage = result.secure_url;
        await updateprofileImageUrl.save();

            // Update profile image URL in Post model
        await Post.updateMany({ username: username }, { $set: { profileImage: result.secure_url } });

        // Update profile image URL in Story model
        await Story.updateMany({ username: username }, { $set: { profileImage: result.secure_url } });
      }).end(avatarFile.buffer);
    }
    if (coverImageFile) {
      cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
        if (error) {
          console.error('Error uploading file to Cloudinary:', error);
          return res.status(500).json({ error: 'Error uploading file to Cloudinary.' });
        }
        const updatecoverImageUrl = await User.findOne({username:username});
        updatecoverImageUrl.coverImage = result.secure_url;
        await updatecoverImageUrl.save();
      }).end(coverImageFile.buffer);
    }


    // Find and update the user in MongoDB
    const updatedUser = await User.findOneAndUpdate({ email }, editedUser, { new: true });

    if (updatedUser) {
      res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}



module.exports = {
  Signup,
  Login,
  Logout,
  getUserDetails,
  ForgotPassword,
  ResetPassword,
  activateAuthUser,
  deleteAuthAccount,
  getAllUserDetails,
  getOtherDetails,
  editUserDetails,
}