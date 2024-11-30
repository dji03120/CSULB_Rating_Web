import mongoose from 'mongoose';

// Sets up the schema for a poll
const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true, // Poll question is required
    },
    options: [{
        type: String,
        required: true, // Each option is required
    }],
    votes: [{
        type: Number,
        default: 0, // Initialize each option's vote count to 0
    }],

    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
    },
    endDate: {
        type: Date,
        required: true, // Poll must have an end date
    },
});

export const PollModel = mongoose.model('polls', PollSchema);