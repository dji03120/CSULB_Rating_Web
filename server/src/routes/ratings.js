import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { RatingModel } from "../models/Ratings.js";
import { UserModel } from "../models/Users.js";

const router = express.Router();

// Configures multer storage to store review images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

// Creates multer instance for handling image upload
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());  // Check file extension
        const mimeType = fileTypes.test(file.mimetype); // Check MIME type

        if (extname && mimeType) {
            cb(null, true);
        } else {
            cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
});

// Route to get all ratings
router.get("/", async (req, res) => {
    try {
        const response = await RatingModel.find({});  // Returns all the ratings
        res.json(response)
    } catch (err) {
        res.json(err);
    }
});

// Route to create a review 
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { name, rating, reviewText, createdBy } = req.body;

        // Image is optional
        let imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || ""; 

        const newRating = new RatingModel({
            name, 
            imageUrl: imagePath,
            rating, 
            reviewText,
            createdBy,
        });
        const response = await newRating.save(); // Saves the rating
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Router to save the rating to the user's ratings
router.put("/", async (req, res) => {
    try {
        // Finds the rating and user
        const rating = await RatingModel.findById(req.body.ratingID);
        const user = await UserModel.findById(req.body.userID);  

        // Adds the rating to the user's ratings
        user.savedRatings.push(rating);
        await user.save();  // Saves the user
        res.json( { savedRatings: user.savedRatings });
    } catch (err) {
        res.json(err);
    }
});

// Route to get the IDs of a user's ratings
router.get("/savedRatings/ids", async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userID);
        res.json({ savedRatings: user?.savedRatings });
    } catch (err) {
        res.json(err)
    }
})

// Route to get the details of a user's ratings
router.get("/savedRatings", async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userID);
        const savedRatings = await RatingModel.find({
            _id: { $in: user.savedRatings },
        });
        res.json({ savedRatings });
    } catch (err) {
        res.json(err)
    }
})

// Route to get the user's ratings
router.get("/my-ratings", async (req, res) => {
    try {
        const { userID } = req.query; // Getting userID from query params
        const response = await RatingModel.find({ createdBy: userID });
        res.json(response);
    } catch (err) {
        res.json(err)
    }
});

// Route to delete a rating
router.delete("/:id", async (req,res) => {
    try {
        const { id } = req.params;

        const deletedRating = await RatingModel.findByIdAndDelete(id);
        res.json({ message: "Rating deleted successfully", deletedRating });
    } catch (err) {
        res.json(err)
    }
});

export { router as ratingsRouter }; 