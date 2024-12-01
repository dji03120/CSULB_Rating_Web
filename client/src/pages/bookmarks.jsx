import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Bookmarks.css";

// Component to access a user's saved posts
const Bookmarks = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [savedRatings, setSavedRatings] = useState([]);
    const [savedPolls, setSavedPolls] = useState([]);
    const [activeTab, setActiveTab] = useState("rating");  // State to track active tab
    const [userVotedPolls, setUserVotedPolls] = useState([]); // Track polls user has voted in

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const userID = localStorage.getItem("userId");
                const response = await axios.get(`http://localhost:5000/auth/savedPosts?userID=${userID}`);
                setSavedPosts(response.data.savedPosts);
    
                const savedRatings = response.data.savedPosts.filter((post) => post.type === "rating");
                setSavedRatings(savedRatings);
    
                const savedPolls = response.data.savedPosts.filter((post) => post.type === "poll");
                setSavedPolls(savedPolls);
    
                if (savedPolls.length > 0) {
                    const pollIDs = savedPolls.map((poll) => poll._id);
                    const pollResponse = await axios.get("http://localhost:5000/polls", {
                        params: { userID, pollIDs },
                    });
    
                    const updatedPolls = pollResponse.data.map((poll) => ({
                        ...poll,
                        hasVoted: poll.voters.includes(userID),
                    }));
                    setSavedPolls(updatedPolls);
                }
    
                const votedPolls = JSON.parse(localStorage.getItem("userVotedPolls")) || [];
                setUserVotedPolls(votedPolls);
            } catch (err) {
                console.error("Failed to fetch bookmarks:", err);
            }
        };
    
        fetchBookmarks();
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

    // Handler for voting on a poll option
	const handleVoteClick = async (pollId, optionIndex) => {
        if (userVotedPolls.includes(pollId)) {
            alert("You have already voted on this poll.");
            return;
        }
    
        try {
            const response = await axios.put("http://localhost:5000/polls/vote", {
                pollID: pollId,
                optionIndex: optionIndex,
                userID: localStorage.getItem("userId"),
            });
    
            if (response.status === 200) {
                alert("Vote submitted successfully!");
    
                // Update polls state with new vote count and mark as voted
                setSavedPolls((prevPolls) => {
                    const updatedPolls = prevPolls.map((poll) =>
                        poll._id === pollId
                            ? {
                                ...poll,
                                hasVoted: true,
                                votes: response.data.updatedPoll.votes,
                            }
                            : poll
                    );
                    console.log("Updated Polls:", updatedPolls); // Debugging state updates
                    return updatedPolls;
                });
                
    
                // Update userVotedPolls in localStorage and state
                const updatedVotedPolls = [...userVotedPolls, pollId];
                setUserVotedPolls(updatedVotedPolls);
                localStorage.setItem("userVotedPolls", JSON.stringify(updatedVotedPolls));
            }
        } catch (err) {
            console.error("Failed to submit vote:", err);
            alert("Failed to submit vote. Please try again.");
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
                                    {/* Show "Voted" badge only if user has voted */}
									{postId.hasVoted && <span className="voted-badge">Voted</span>}
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
                                    {postId.options.map((option, index) => {
                                        const totalVotes = postId.votes.reduce((a, b) => a + b, 0); // Calculate total votes
                                        const optionVotes = postId.votes[index]; // Get votes for the option
                                        const percentage = totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(1) : "0.0"; // Calculate percentage

                                        const now = new Date(); // Current time
                                        const isPollEnded = new Date(postId.endDate) < now; // Check if poll is ended

                                        return (
                                            <div key={index} className="poll-option-container">
                                                {/* Option Button */}
                                                <button
                                                    disabled={postId.hasVoted || isPollEnded} // Disabled when it is voted or has ended
                                                    onClick={() => handleVoteClick(postId._id, index)}
                                                >
                                                    {option}
                                                </button>

                                                {/* Show Results */}
                                                <div className="poll-results">
                                                    <div
                                                        className="poll-bar"
                                                        style={{
                                                            width: `${Math.max(percentage, 1)}%`,
                                                            background: `linear-gradient(45deg, rgba(253, 18, 111, 0.2), rgba(255, 221, 0, 0.264), rgba(5, 209, 245, 0.2))`,
                                                            height: "10px",
                                                            marginTop: "5px",
                                                        }}
                                                    ></div>
                                                    <span>{`${optionVotes} votes (${percentage}%)`}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="poll-footer">
										{/* Poll ended message */}
										{new Date(postId.endDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
											<p className="poll-ended-message">This poll has ended.</p>
										) : (
											// Still voting
											<p>
												{postId.votes.reduce((a, b) => a + b, 0)} Votes - Poll ends {new Date(postId.endDate).toLocaleDateString()}
											</p>
										)}
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
