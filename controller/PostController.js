const Post = require("../models/posts");
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.MY_CLOUD_NAME,
    api_key: process.env.MY_API_KEY,
    api_secret: process.env.MY_API_SECRET
});

async function addPost(req, res) {
    try {
        const { content, contentType, user, username, profileImage } = req.body;
        const { file } = req;

        // Check if the user posts both text content and a file
        if (content && file) {
            cloudinary.uploader.upload_stream({ resource_type: "auto" }, async (error, result) => {
                if (error) {
                    console.error('Error uploading file to Cloudinary:', error);
                    return res.status(500).json({ error: 'Error uploading file to Cloudinary.' });
                }

                const newPostData = {
                    user,
                    username,
                    profileImage: profileImage!='' ?profileImage : username,
                    contentType,
                    content,
                    media: result.secure_url // Store the file URL from Cloudinary
                };

                const newPost = new Post(newPostData);
                await newPost.save();
                return res.status(201).json({ newPost, message: "Post created successfully" });
            }).end(req.file.buffer);
        } else if (content) {
            // User posts only text content, store in MongoDB
            const newPostData = {
                user,
                username,
                profileImage: profileImage!='' ?profileImage : username,
                contentType,
                content
            };

            const newPost = new Post(newPostData);
            await newPost.save();
            return res.status(201).json({ newPost, message: "Post created successfully" });
        } else {
            return res.status(400).json({ message: "Invalid request. Please provide content or file." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


async function likePost(req, res) {
    try {
        const { userID } = req.body;
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const existingLikeIndex = post.likes.findIndex(
            (like) => like.user.toString() === userID.toString()
        );
        if (existingLikeIndex !== -1) {
            post.likes.splice(existingLikeIndex, 1);
        } else {
            post.likes.push({
                user: userID,
                status: true,
            });
        }

        const likedPost = await post.save();
        res.status(200).json({ message: "Likes updated successfully", likedPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function addCommentOnPost(req, res) {
    try {
        const { userID,username, text,profileImage } = req.body;
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.push({
            user: userID,
            username: username,
            profileImage: profileImage,
            text: text,
        });

        const commentPost = await post.save();
        res.status(200).json({ message: "Comment added successfully", commentPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function deleteComment(req, res) {
    try {
        const postId = req.params.postId;
        const commentId = req.params.cmtId;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const commentIndex = post.comments.findIndex(
            (comment) => comment._id.toString() === commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found" });
        }

        post.comments.splice(commentIndex, 1);

        await post.save();

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function deletePost(req, res) {
    try {
        const postId = req.params.postId;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        await Post.deleteOne({ _id: postId });

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


async function getAllPost(req, res) {
    try {
        const posts = await Post.find().exec();
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    addPost,
    getAllPost,
    likePost,
    addCommentOnPost,
    deleteComment,
    deletePost,
}