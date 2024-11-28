import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/Users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { studentId, email, password } = req.body;

    try {
        const user = await UserModel.findOne({ studentId });
        // console.log(user);
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ studentId, email, password: hashedPassword, createdAt: new Date() });
        await newUser.save();

        return res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        return res.status(200).json({ message: "User logged in successfully", token, user });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Route for user to save a post
router.put("/savePost", async (req, res) => {
    try {
        const { postType, postId } = req.body;
        const { userID } = req.query;

        const user = await UserModel.findById(userID);

        const alreadySaved = user.savedPosts.some(post => post.postId.toString() === postId.toString() && post.postType === postType);

        if (alreadySaved) {
            return res.status(400).json({ error: "Post already saved" });
        }

        user.savedPosts.push({ postType, postId});
        await user.save();

        res.json({ message: "Post saved successfully", savedPosts: user.savedPosts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

export { router as userRouter };




