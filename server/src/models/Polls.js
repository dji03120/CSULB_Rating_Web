import mongoose from 'mongoose';

// Sets up the schema for a poll
const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const PollModel = mongoose.model('polls', PollSchema);