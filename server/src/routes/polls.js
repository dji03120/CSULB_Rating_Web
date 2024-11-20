import express from "express";
import mongoose from "mongoose";
import path from "path";
import { PollModel } from "../models/Polls.js";
import { UserModel } from "../models/Users.js";

const router = express.Router();

// Route to get all polls
router.get("/", async (req, res) => {
    try {
        const response = await PollModel.find({});  // Returns all the polls
        res.json(response)
    } catch (err) {
        res.json(err);
    }
});

// Create a new poll
router.post('/', async (req, res) => {
    const { question, options } = req.body;

    // Validate input
    if (!question || !options || options.length < 2 || options.some(option => !option.trim())) {
        return res.status(400).json({ error: 'Invalid input. Ensure a valid question and at least two options.' });
    }

    try {
        // Save the poll to the database
        const newPoll = new PollModel({ question, options });
        const savedPoll = await newPoll.save();

        res.status(200).json(savedPoll);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save poll. Please try again later.' });
    }
});

// Save a poll to a user's saved polls
router.put("/save", async (req, res) => {
    try {
        const { pollID, userID } = req.body;

        const poll = await PollModel.findById(pollID);
        const user = await UserModel.findById(userID);

        if (!poll || !user) {
            return res.status(404).json({ error: "Poll or user not found." });
        }

        if (!user.savedPolls.includes(pollID)) {
            user.savedPolls.push(pollID);
            await user.save();
        }

        res.json({ savedPolls: user.savedPolls });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get saved poll IDs for a user
router.get("/savedPolls/ids", async (req, res) => {
    try {
        const { userID } = req.query;
        const user = await UserModel.findById(userID);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.json({ savedPolls: user.savedPolls });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get details of saved polls
router.get("/savedPolls", async (req, res) => {
    try {
        const { userID } = req.query;
        const user = await UserModel.findById(userID);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const savedPolls = await PollModel.find({
            _id: { $in: user.savedPolls },
        });

        res.json(savedPolls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export { router as pollsRouter }; 