import React, { useState } from 'react';
import axios from 'axios';
import filledStar from '../assets/star.png'; // Path to your filled star image
import emptyStar from '../assets/grayed-star.png';   // Path to your empty star image

// Function to create a rating
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

    // Returns the Create Rating form
    return (
        <div>
            <h2>Create Rating</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    {/* Name of the school location/event */}
                    <label>Name of Place/Event: </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    {/* Upload an image from files */}
                    <label>Upload Image: </label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <div>
                    {/* Rating of the place */}
                    <label>Rating: </label>
                    {/* Corresponds the number of stars to the rating number */}
                    <div style={{ display: 'flex', flexDirection: 'row', cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <img
                                key={star}
                                src={star <= rating ? filledStar : emptyStar}
                                alt={`${star} star`}
                                onClick={() => handleStarClick(star)}
                                style={{ width: '34px', height: '30px', marginRight: '5px' }}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    {/* Review Section */}
                    <label>Review: </label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                    />
                </div>
                {/* Submit Button */}
                <button type="submit">Submit Rating</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Rating submitted successfully!</p>}
        </div>
    );
};

export default CreateRating;
