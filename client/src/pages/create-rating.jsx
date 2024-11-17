import React, { useState } from 'react';
import axios from 'axios';
import filledStar from '../assets/star.png'; // Path to your filled star image
import emptyStar from '../assets/grayed-star.png';   // Path to your empty star image

const CreateRating = () => {
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState("");
    const [image, setImage] = useState("");
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post('http://localhost:5000/ratings', {
                name,
                imageUrl,
                rating,
                reviewText,
            });
            if (response.status === 200) {
                setSuccess(true);
                setName('');
                setRating(0);
                setReviewText('');
            }
        } catch (err) {
            console.log(err)
            setError('An error occurred while submitting your rating.');
        }
    };

    const handleStarClick = (starValue) => {
        setRating(starValue);
    };

    return (
        <div>
            <h2>Create Rating</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Upload Image:</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <div>
                    <label>Paste Image URL:</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>
                <div>
                    <label>Rating:</label>
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
                    <label>Review:</label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit Rating</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Rating submitted successfully!</p>}
        </div>
    );
};

export default CreateRating;
