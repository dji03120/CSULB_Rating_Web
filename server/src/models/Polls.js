import mongoose from 'mongoose';

// Sets up the schema for a poll
// required things always to be true. Becasue it is required.
const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true, // Poll question is required
    },
    options: [{
        type: String,
        required: true, // Each option is required
    }],
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