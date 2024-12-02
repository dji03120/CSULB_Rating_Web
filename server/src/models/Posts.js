const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entityType: {
        type: String,
        required: true,
        enum: ['class', 'event', 'food', 'restaurant/cafe', 'concert']
    },
    entityName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['rating', 'poll']
    },
    question: {
        type: String,
        required: true
    },
    // For rating posts
    scale: {
        type: Number,
        required: function () { return this.type === 'rating'; }
    },
    // For poll posts
    options: [{
        text: String,
        votes: {
            type: Number,
            default: 0
        }
    }],
    // Common fields
    votes: {
        useful: { type: Number, default: 0 },
        notUseful: { type: Number, default: 0 }
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    lifetime: {
        type: Date,
        required: false
    },
    responses: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        pollOption: Number,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    }
});

// Generate unique link for sharing
postSchema.pre('save', function (next) {
    if (!this.shareLink) {
        this.shareLink = `${process.env.BASE_URL}/posts/${this._id}`;
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);