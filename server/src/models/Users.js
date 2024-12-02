import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    savedPosts: [{
        postType: { type: String, enum: ['rating', 'poll'], required: true },
        postId: { type: mongoose.Schema.Types.ObjectId, refPath: 'savedPosts.postType', required: true },
    }],
    votes: {
        type: Map,
        of: String,
        default: () => new Map()
    },
    // Update Posts models to include vote counts
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    }
});

export const UserModel = mongoose.model('users', UserSchema);