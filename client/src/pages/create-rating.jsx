import React, { useState } from 'react';
import axios from 'axios';
import filledStar from '../assets/star.png'; // Path to your filled star image
import emptyStar from '../assets/grayed-star.png';   // Path to your empty star image
import rightArrow from '../assets/right-arrow.png';  // Path to right arrow image
import './CreateRating.css';

// Component to create a rating
const CreateRating = () => {
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState("");
    const [image, setImage] = useState("");
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Handles submission of the review
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
    
        // Create a new FormData object
        const formData = new FormData();
        formData.append("name", name);
        formData.append("rating", rating);
        formData.append("reviewText", reviewText);
        if (image) {
            formData.append("image", image); // Attach the image file
        } else {
            formData.append("imageUrl", imageUrl); // Use imageUrl if no file is uploaded
        }
    
        try {
            const response = await axios.post('http://localhost:5000/ratings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.status === 200) {
                setSuccess(true);
                setName('');
                setRating(0);
                setReviewText('');
                setImage(null); // Clear the image state
                setImageUrl(''); // Clear the image URL state
            }
        } catch (err) {
            console.log(err);
            setError('An error occurred while submitting your rating.');
        }
    };
    

    // Sets the rating when clicking on the stars
    const handleStarClick = (starValue) => {
        setRating(starValue);
    };

    // Handles uploading an image file
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setImageUrl(URL.createObjectURL(file)); // Create a temporary URL for image preview
        }
    };

    // Returns the Create Rating form
    return (
        <div className="create-rating-wrapper">
            {/* Title Section */}
            <h1 className="page-title">Create a New Rating</h1>

            {/* Form Container */}
            <div className="create-rating-container">
                {/* Left side: Title and Image */}
                <div className="create-rating-left">
                    <div>
                        <label>Title: </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Name of cafe, concert, events, food, etc."
                        />
                    </div>
                    {/* Image */}
                    <div>
                        <label>Upload Image: </label>
                        <input
                            type="file"
                            onChange={handleImageUpload}
                        />
                        {/* Gives an image preview */}
                        {imageUrl && <img src={imageUrl} alt="Image Preview" className="image-preview" />}
                    </div>
                </div>

                {/* Right side: Submit button, rating, and review */}
                <div className="create-rating-right">
                    {/* Submit button */}
                    <img 
                        src={rightArrow}
                        className="submit-button"
                        onClick={handleSubmit}
                    />
                    {/* Rating */}
                    <div className="rating-stars-container"> 
                        <div className="rating-stars">
                            {/* Correlates number of stars pressed to the rating number */}
                            {[1, 2, 3, 4, 5].map((star) => (
                                <img
                                    key={star}
                                    src={star <= rating ? filledStar : emptyStar}
                                    alt={`${star} star`}
                                    onClick={() => handleStarClick(star)}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Review */}
                    <div>
                        <label>Review: </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            required
                            placeholder="Write your review here..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRating;
