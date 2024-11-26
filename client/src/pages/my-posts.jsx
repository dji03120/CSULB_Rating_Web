import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyPosts.css";

// Component to access a user's posts
const MyPosts = () => {
    const [userRatings, setUserRatings] = useState([]);
    const [loading, setLoading] = useState(true);  // State to track loading status

    useEffect(() => {
        const userID = localStorage.getItem("userId");  // Gets the current user's id
    
        // Fetches the user's ratings
        const fetchUserRatings = async () => {
            setLoading(true); // Sets loading to true before making the request
            try {
                const response = await axios.get("http://localhost:5000/ratings/my-posts", {
                    params: { userID }
                });
                setUserRatings(response.data);  // Sets the user's ratings
            } catch (err) {
                console.error("Error fetching user ratings:", err);
            } finally {
                setLoading(false); // Sets loading to false after the request is done
            }
        };
        fetchUserRatings();
    }, []);
    

    // Returns the user's posts
    return (
        <div>
            <h1 className="my-posts-page-title">My Posts</h1>
            <div>
                {userRatings.length === 0 ? (
                    <p>No posts found.</p>
                ) : (
                        userRatings.map((rating) => (
                            <div className="my-posts-review-card">
                                <div key={rating._id}>
                                    <h3>{rating.name}</h3>
                                    <p>{rating.reviewText}</p>
                                    <img 
                                        src={`http://localhost:5000${rating.imageUrl}`}
                                        alt={rating.name}
                                    />
                                    <p>Rating: {rating.rating}</p>
                                </div>
                            </div>
                        ))
                    )}
            </div>
        </div>
    );
};

export default MyPosts;
