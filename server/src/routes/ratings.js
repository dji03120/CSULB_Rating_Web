import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { RatingModel } from "../models/Ratings.js";
import { UserModel } from "../models/Users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Configures multer storage to store review images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        // 🔐 Use unique filename to prevent overwrite attack
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
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
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get the user's ratings
router.get("/my-ratings", verifyToken, async (req, res) => {
    try {
        // 🔐 use JWT instead of query
        const response = await RatingModel.find({ createdBy: req.user.id });
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const rating = await RatingModel.findById(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }
        res.json(rating);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Route to create a review 
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
    try {
        const { name, rating, reviewText } = req.body;

        // Image is optional
        let imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || ""; 

        // 🔐 Use authenticated user instead of client input
        const newRating = new RatingModel({
            name, 
            imageUrl: imagePath,
            rating, 
            reviewText,
            createdBy: req.user.id,
        });

        const response = await newRating.save(); // Saves the rating
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Router to save the rating to the user's ratings
router.put("/", verifyToken, async (req, res) => {
    try {
        const rating = await RatingModel.findById(req.body.ratingID);
        const user = await UserModel.findById(req.user.id);  

        user.savedRatings.push(rating);
        await user.save();
        res.json({ savedRatings: user.savedRatings });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get the IDs of a user's ratings
router.get("/savedRatings/ids", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        res.json({ savedRatings: user?.savedRatings });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
})

// Route to get the details of a user's ratings
router.get("/savedRatings", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        const savedRatings = await RatingModel.find({
            _id: { $in: user.savedRatings },
        });
        res.json({ savedRatings });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
})

// Route to delete a rating
router.delete("/:id", verifyToken, async (req,res) => {
    try {
        const { id } = req.params;

        const rating = await RatingModel.findById(id);

        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        // 🔐 Only creator can delete
        if (rating.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await rating.deleteOne();
        res.json({ message: "Rating deleted successfully", rating });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export { router as ratingsRouter };