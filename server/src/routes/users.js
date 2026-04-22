import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/Users.js";
import { RatingModel } from "../models/Ratings.js";
import { PollModel } from "../models/Polls.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { studentId, email, password } = req.body;

    try {
        const user = await UserModel.findOne({ studentId });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ studentId, email, password: hashedPassword, createdAt: new Date() });
        await newUser.save();

        return res.status(201).json({ message: "User created successfully" });
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    const { studentId, password } = req.body;

    try {
        const user = await UserModel.findOne({ studentId });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const { password: _, ...safeUser } = user.toObject();

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: safeUser
        });
    }
    catch {
        return res.status(500).json({ message: "Server error" });
    }
});

// Route for user to save a post
router.put("/savePost", verifyToken, async (req, res) => {
    try {
        const { postType, postId } = req.body;

        const user = await UserModel.findById(req.user.id);

        const alreadySaved = user.savedPosts.some(post => 
            post.postId.toString() === postId.toString() && post.postType === postType
        );

        if (alreadySaved) {
            return res.status(400).json({ error: "Post already saved" });
        }

        user.savedPosts.push({ postType, postId });
        await user.save();

        res.json({ message: "Post saved successfully", savedPosts: user.savedPosts });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

// Route for user to unsave a post
router.put("/unsavePost", verifyToken, async (req, res) => {
    try {
        const { postType, postId } = req.body;

        const user = await UserModel.findById(req.user.id);

        const postIndex = user.savedPosts.findIndex(
            (post) => post.postId.toString() === postId.toString() && post.postType === postType
        );

        if (postIndex === -1) {
            return res.status(400).json({ error: "Post not found in saved posts" });
        }

        user.savedPosts.splice(postIndex, 1);
        await user.save();

        res.json({ message: "Post unsaved successfully", savedPosts: user.savedPosts });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get the user's saved posts
router.get("/savedPosts", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const savedPosts = await Promise.all(
            user.savedPosts.map(async (savedPost) => {
                if (savedPost.postType === "rating") {
                    savedPost.postId = await RatingModel.findById(savedPost.postId);
                } else if (savedPost.postType === "poll") {
                    savedPost.postId = await PollModel.findById(savedPost.postId);
                }
                return savedPost;
            })
        );

        res.json({ savedPosts });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

// Get user's votes
router.get("/votes", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ votes: user.votes || {} });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

// Handle votes
router.put("/vote", verifyToken, async (req, res) => {
    try {
        const { postId, postType, voteType } = req.body;

        const user = await UserModel.findById(req.user.id);

        if (!user.votes) {
            user.votes = new Map();
        }

        const Model = postType === 'rating' ? RatingModel : PollModel;
        const post = await Model.findById(postId);

        const currentVote = user.votes.get(postId);

        if (currentVote) {
            post[currentVote + 'votes']--;
        }

        if (voteType) {
            post[voteType + 'votes']++;
            user.votes.set(postId, voteType);
        } else {
            user.votes.delete(postId);
        }

        await post.save();
        await user.save();

        res.json({
            message: "Vote updated",
            updatedPost: post,
            votes: Object.fromEntries(user.votes)
        });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
});

export { router as userRouter };