import express from "express";
import mongoose from "mongoose";
import { PollModel } from "../models/Polls.js";
import { UserModel } from "../models/Users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Route to get all polls
router.get("/", async (req, res) => {
    try {
        const response = await PollModel.find({});
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch polls." });
    }
});

// Route to get the user's polls
router.get("/my-polls", verifyToken, async (req, res) => {
    try {
        const response = await PollModel.find({ createdBy: req.user.id });
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const poll = await PollModel.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }
        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Route to create a new poll
router.post("/", verifyToken, async (req, res) => {
    const { question, options, endDate } = req.body;

    // Validate input
    if (!question || !options || options.length < 2 || options.some((option) => !option.trim())) {
        return res.status(400).json({ error: "Invalid input. Ensure a valid question and at least two options." });
    }

    if (!endDate || isNaN(new Date(endDate))) {
        return res.status(400).json({ error: "Invalid end date." });
    }

    const selectedDate = new Date(endDate);
    selectedDate.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return res.status(400).json({ error: "End date cannot be in the past." });
    }

    try {
        const votes = Array(options.length).fill(0);

        const newPoll = new PollModel({
            question,
            options,
            endDate: selectedDate,
            votes,
            createdBy: req.user.id // 🔐
        });

        const savedPoll = await newPoll.save();
        res.status(200).json(savedPoll);
    } catch (err) {
        res.status(500).json({ error: "Failed to create poll." });
    }
});

// Route to add a vote to a poll
router.put("/vote", verifyToken, async (req, res) => {
    const { pollID, optionIndex } = req.body;
    const userID = req.user.id;

    try {
        const poll = await PollModel.findById(pollID);

        if (!poll) {
            return res.status(404).json({ error: "Poll not found." });
        }

        const now = new Date();
        if (now > new Date(poll.endDate)) {
            return res.status(403).json({ error: "This poll has already ended." });
        }

        // 🔐 secure comparison
        if (poll.voters.some(v => v.toString() === userID)) {
            return res.status(403).json({ error: "You have already voted." });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ error: "Invalid option index." });
        }

        poll.votes[optionIndex] += 1;
        poll.voters.push(userID);

        await poll.save();

        res.status(200).json({ message: "Vote recorded successfully!", updatedPoll: poll });
    } catch (err) {
        res.status(500).json({ error: "Failed to record vote." });
    }
});

// Route to save a poll to a user's saved polls
router.put("/save", verifyToken, async (req, res) => {
    const { pollID } = req.body;

    try {
        const poll = await PollModel.findById(pollID);
        const user = await UserModel.findById(req.user.id);

        if (!poll) {
            return res.status(404).json({ error: "Poll not found." });
        }

        if (user.savedPolls.includes(pollID)) {
            return res.status(400).json({ error: "Poll already saved." });
        }

        user.savedPolls.push(pollID);
        await user.save();

        res.status(200).json({ message: "Poll saved successfully!", savedPolls: user.savedPolls });
    } catch (err) {
        res.status(500).json({ error: "Failed to save poll." });
    }
});

// Route to get the IDs of polls saved by a user
router.get("/savedPolls/ids", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        res.status(200).json({ savedPolls: user.savedPolls });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch saved polls." });
    }
});

// Route to get detailed data of polls saved by a user
router.get("/savedPolls", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);

        const savedPolls = await PollModel.find({
            _id: { $in: user.savedPolls },
        });

        res.status(200).json(savedPolls);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch saved poll details." });
    }
});

// Route to delete a poll
router.delete("/:id", verifyToken, async (req,res) => {
    try {
        const poll = await PollModel.findById(req.params.id);

        if (!poll) return res.status(404).json({ message: "Poll not found" });

        if (poll.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await poll.deleteOne();
        res.json({ message: "Poll deleted successfully", deletedPoll: poll });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export { router as pollsRouter };