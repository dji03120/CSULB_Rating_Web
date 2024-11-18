import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path'; 
import { fileURLToPath } from 'url';
import { userRouter } from './src/routes/users.js';
import { ratingsRouter } from './src/routes/ratings.js';

import dotenv from 'dotenv';
dotenv.config();

// Construct __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the uploads directory if it doesn't exist
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


// API Routes
app.get('/', (req, res) => {
    res.json({ message: 'Ratings API' });
});

app.use('/auth', userRouter);
app.use('/ratings', ratingsRouter);
app.use('/uploads', express.static('uploads'));

// app.use('/posts', postRouter);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});