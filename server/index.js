import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path'; 
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

import { userRouter } from './src/routes/users.js';
import { ratingsRouter } from './src/routes/ratings.js';
import { pollsRouter } from './src/routes/polls.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it does not exist
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

const app = express();

// Apply security headers (prevents XSS, clickjacking, etc.)
// Modify cross-origin resource policy to allow images to be loaded from other domains
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://csulb-rating-web.vercel.app"
  ],
  credentials: true
}));

// Limit JSON payload size (prevents DoS attacks)
app.use(express.json({ limit: "10kb" }));

// Prevent NoSQL injection
app.use(mongoSanitize());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Base route
app.get('/', (req, res) => {
    res.json({ message: 'Ratings API' });
});

// API routes
app.use('/auth', userRouter);
app.use('/ratings', ratingsRouter);
app.use('/polls', pollsRouter);

// Restrict access to uploads directory
app.use('/uploads', express.static('uploads', {
    dotfiles: "deny",
    index: false
}));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});