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
});

export const UserModel = mongoose.model('users', UserSchema);