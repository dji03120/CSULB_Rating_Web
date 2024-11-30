import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Bookmarks.css";

// Component to access a user's saved posts
const Bookmarks = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("rating");  // State to track active tab

    useEffect(() => {
        // Fetches the user's saved posts
        const fetchSavedPosts = async () => {
            try {
                const userID = localStorage.getItem("userId");
                const response = await axios.get(`http://localhost:5000/auth/savedPosts?userID=${userID}`);
                console.log("Fetched posts:", response.data.savedPosts);
                setSavedPosts(response.data.savedPosts);
            } catch (err) {
                console.error("Failed to fetch posts:", err);
            }
        };
        fetchSavedPosts();
    }, []);

    const handleUnsaveClick = async (postType, postId) => {
        try {
            const userID = localStorage.getItem("userId");

            // Remove from saved posts
            await axios.put(`http://localhost:5000/auth/unsavePost?userID=${userID}`, {
                postType,
                postId,
            });

            // Update the state
            setSavedPosts((prev) =>
                prev.filter((post) => !(post.postType === postType && post.postId && post.postId._id === postId.toString()))
            );
        } catch (err) {
            console.error("Failed to unsave post:", err);
        }
    };

    // Returns the user's saved posts based on active tab

    const renderSavedPosts = () => {
        const filteredPosts = savedPosts.filter(
            (post) => post.postType === activeTab && post.postId
        );
    
        return filteredPosts.length === 0 ? (
            <p>No saved {activeTab} posts yet.</p>
        ) : (
            filteredPosts.map(({ postType, postId }) => {
                // Ensure postId is not null or undefined
                if (!postId) {
                    return null; // Skip rendering this post
                }
    
                return (
                    <div className="saved-post-cards" key={postId._id}>
                        {postType === "rating" && (
                            <div className="saved-rating-card">
                            <div className="post-header">
                                <div className="post-votes">
                                    <img
                                        id="upvote-arrow"
                                        src="src/assets/up-arrow.png"
                                        alt="upvote"
                                        style={{ transform: "rotate(100)" }}
                                    />
                                    <img
                                        id="downvote-arrow"
                                        src="src/assets/down-arrow.png"
                                        alt="downvote"
                                    />
                                </div>
                                <div className="post-title">
                                    <h1>{postId.name}</h1>
                                </div>
                                <div className="post-right">
                                    <button>Share</button>
                                    <img
                                        src="src/assets/heart.png"
                                        alt="like-icon"
                                        className="post-heart"
                                        onClick={() => handleUnsaveClick("rating", postId._id)}
                                    />
                                </div>
                            </div>
                            <div className="post-content">
                                <div className="content-left">
                                    <img
                                        src={`http://localhost:5000${postId.imageUrl}`}
                                        alt={postId.name}
                                    />
                                </div>
                                <div className="content-right">
                                    <div className="content-ratings">
                                        {Array.from({ length: postId.rating }, (_, index) => (
                                            <img
                                                key={index}
                                                src="src/assets/star.png"
                                                alt="star"
                                                className="rating-star"
                                            />
                                        ))}
                                    </div>
                                    <div className="content-description">
                                        <h2>My Review:</h2>
                                        <p>{postId.reviewText}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}
    
                        {postType === "poll" && (
                            <div className="saved-poll-card">
                                <div className="poll-header">
                                <div className="poll-votes">
                                    <img
                                        id="upvote-arrow"
                                        src="src/assets/up-arrow.png"
                                        alt="upvote"
                                        style={{ transform: "rotate(100)" }}
                                    />
                                    <img
                                        id="downvote-arrow"
                                        src="src/assets/down-arrow.png"
                                        alt="downvote"
                                    />
                                </div>
                                <div className="poll-right">
                                    <button>Share</button>
                                    <img
                                        src="src/assets/heart.png"
                                        alt="like-icon"
                                        className="post-heart"
                                        onClick={() => handleUnsaveClick("poll", postId._id)}
                                    />
                                </div>
                            </div>
                            <div className="poll-content">
                                <div className="poll-title">
                                    <h1>Poll: {postId.question}</h1>
                                </div>
                                <p className="poll-instruction">Select one option:</p>
                                <div className="poll-options">
                                    {postId.options.map((option, index) => (
                                        <button
                                            key={index}
                                            className="poll-option"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                <div className="poll-footer">
                                    <p>
                                        {postId.votes
                                            ? postId.votes.reduce((a, b) => a + b, 0)
                                            : 0}{" "}
                                        Votes - Poll ends {new Date(postId.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                );
            })
        );
    };
    

    return (
        <div className="my-posts-content">
            <h1 className="bookmarks-page-title">Bookmarks</h1>
            {/* Tab Navigation */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === "rating" ? "active" : ""}`}
                    onClick={() => setActiveTab("rating")}
                >
                    Ratings
                </button>
                <button
                    className={`tab ${activeTab === "poll" ? "active" : ""}`}
                    onClick={() => setActiveTab("poll")}
                >
                    Polls
                </button>
            </div>

            <div className="saved-posts-list">
                {renderSavedPosts()}
            </div>
        </div>
    );
};

export default Bookmarks;
