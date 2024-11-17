import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { RatingModel } from "../models/Ratings.js";
import { UserModel } from "../models/Users.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            cb(null, true);
        } else {
            cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
});

router.get("/", async (req, res) => {
    try {
        const response = await RatingModel.find({});  // Returns all the ratings
        res.json(response)
    } catch (err) {
        res.json(err);
    }
});

router.post("/", upload.single("image"), async (req, res) => {
    try {
        console.log(req.file);
        const { name, rating, reviewText } = req.body;

        let imagePath = req.file ? `uploads/${req.file.filename}` : req.body.imageUrl || ""; 

        const newRating = new RatingModel({
            name, 
            imageUrl: imagePath,
            rating, 
            reviewText
        });
        const response = await newRating.save(); // Saves the rating
        res.json(response)
    } catch (err) {
        res.json(err);
    }
});

router.put("/", async (req, res) => {
    try {
        const rating = await RatingModel.findById(req.body.ratingID);
        const user = await UserModel.findById(req.body.userID);   
        user.savedRatings.push(rating);
        await user.save();  
        res.json( { savedRatings: user.savedRatings });
    } catch (err) {
        res.json(err);
    }
});

router.get("/savedRatings/ids", async (req, res) => {
    try {
        const user = await UserModel.findById(req.body.userID);
        res.json({ savedRatings: user?.savedRatings });
    } catch (err) {
        res.json(err)
    }
})

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

export { router as ratingsRouter }; 