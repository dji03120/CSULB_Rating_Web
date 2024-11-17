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
    savedRatings: [{
        type: mongoose.Schema.Types.ObjectId, ref: "ratings" 
    }],
});

export const UserModel = mongoose.model('users', UserSchema);