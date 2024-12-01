import express from "express";
import mongoose from "mongoose";
import { PollModel } from "../models/Polls.js";
import { UserModel } from "../models/Users.js";

const router = express.Router();

// Route to get all polls
router.get("/", async (req, res) => {
    try {
        const response = await PollModel.find({}); // Fetch all polls from the database
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch polls." });
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
        res.status(500).json({ message: error.message });
    }
});

// Route to create a new poll
router.post("/", async (req, res) => {
    const { question, options, endDate, createdBy } = req.body;

    // Validate input
    if (!question || !options || options.length < 2 || options.some((option) => !option.trim())) {
        return res.status(400).json({ error: "Invalid input. Ensure a valid question and at least two options." });
    }

    if (!endDate || isNaN(new Date(endDate))) {
        return res.status(400).json({ error: "Invalid end date. Ensure it is a valid date format." });
    }

    try {
        // Initialize an array of votes with zeros for each option
        const votes = Array(options.length).fill(0);

        // Create a new poll document
        const newPoll = new PollModel({ question, options, endDate: new Date(endDate), votes, createdBy });
        const savedPoll = await newPoll.save(); // Save the poll to the database

        res.status(200).json(savedPoll);
    } catch (err) {
        res.status(500).json({ error: "Failed to create poll. Please try again later." });
    }
});

// Route to add a vote to a poll
router.put("/vote", async (req, res) => {
    const { pollID, optionIndex, userID } = req.body;

    if (!pollID || typeof optionIndex !== "number" || !userID) {
        return res.status(400).json({ error: "Poll ID, option index, and user ID are required." });
    }

    try {
        const poll = await PollModel.findById(pollID);

        if (!poll) {
            return res.status(404).json({ error: "Poll not found." });
        }

        // Check if user has already voted
        if (poll.voters.includes(userID)) {
            return res.status(403).json({ error: "You have already voted on this poll." });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ error: "Invalid option index." });
        }

        // Increment vote count and record user as voter
        poll.votes[optionIndex] += 1;
        poll.voters.push(userID);

        await poll.save();

        res.status(200).json({ message: "Vote recorded successfully!", updatedPoll: poll });
    } catch (err) {
        res.status(500).json({ error: "Failed to record vote. Please try again later." });
    }
});


// Route to save a poll to a user's saved polls
router.put("/save", async (req, res) => {
    const { pollID, userID } = req.body;

    if (!pollID || !userID) {
        return res.status(400).json({ error: "Poll ID and User ID are required." });
    }

    try {
        const poll = await PollModel.findById(pollID); // Fetch the poll by ID
        const user = await UserModel.findById(userID); // Fetch the user by ID

        if (!poll) {
            return res.status(404).json({ error: "Poll not found." });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (user.savedPolls.includes(pollID)) {
            return res.status(400).json({ error: "Poll already saved." });
        }

        // Add the poll ID to the user's saved polls array
        user.savedPolls.push(pollID);
        await user.save(); // Save the updated user document

        res.status(200).json({ message: "Poll saved successfully!", savedPolls: user.savedPolls });
    } catch (err) {
        res.status(500).json({ error: "Failed to save poll. Please try again later." });
    }
});

// Route to get the IDs of polls saved by a user
router.get("/savedPolls/ids", async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ error: "User ID is required." });
    }

    try {
        const user = await UserModel.findById(userID); // Fetch the user by ID

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ savedPolls: user.savedPolls });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch saved polls." });
    }
});

// Route to get detailed data of polls saved by a user
router.get("/savedPolls", async (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).json({ error: "User ID is required." });
    }

    try {
        const user = await UserModel.findById(userID); // Fetch the user by ID

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Fetch the details of polls saved by the user
        const savedPolls = await PollModel.find({
            _id: { $in: user.savedPolls },
        });

        res.status(200).json(savedPolls);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch saved poll details." });
    }
});

// Route to get the user's polls
router.get("/my-polls", async (req, res) => {
    try {
        const { userID } = req.query; // Getting userID from query params
        const response = await PollModel.find({ createdBy: userID });
        res.json(response);
    } catch (err) {
        res.json(err)
    }
});

// Route to delete a poll
router.delete("/:id", async (req,res) => {
    try {
        const { id } = req.params;

        const deletedPoll = await PollModel.findByIdAndDelete(id);
        res.json({ message: "Poll deleted successfully", deletedPoll });
    } catch (err) {
        res.json(err)
    }
});

export { router as pollsRouter };