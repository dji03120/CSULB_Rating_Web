import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyPosts.css";

// Component to access a user's posts
const MyPosts = () => {
    const [userRatings, setUserRatings] = useState([]);
    const [userPolls, setUserPolls] = useState([]);
    const [loading, setLoading] = useState(true);  // State to track loading status

    useEffect(() => {
        const userID = localStorage.getItem("userId");  // Gets the current user's id
    
        // Fetches the user's ratings
        const fetchUserRatings = async () => {
            setLoading(true); // Sets loading to true before making the request
            try {
                const response = await axios.get("http://localhost:5000/ratings/my-ratings", {
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

        // Fetches the user's polls
        const fetchUserPolls = async () => {
            setLoading(true); // Sets loading to true before making the request
            try {
                const response = await axios.get("http://localhost:5000/polls/my-polls", {
                    params: { userID }
                });
                setUserPolls(response.data);  // Sets the user's polls
            } catch (err) {
                console.error("Error fetching user polls:", err);
            } finally {
                setLoading(false); // Sets loading to false after the request is done
            }
        };
        fetchUserPolls();
    }, []);
    

    // Returns the user's posts
    // Returns the user's posts
return (
    <div>
        <h1 className="my-posts-page-title">My Posts</h1>
        <div>
            {userRatings.length === 0 && userPolls.length === 0 ? (
                <p>No posts found.</p>
            ) : (
                <>
                    {/* Map through user ratings */}
                    {userRatings.map((rating) => (
                        <div className="my-reviews-card" key={rating._id}>
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
									style={{}}
								/>
							</div>
							<div className="post-title">
								<h1>{rating.name}</h1>
							</div>
							<div className="post-right">
								<button>Share</button>
								<img
									src="src/assets/heart.png"
									alt="like-icon"
								/>
                                <button>Delete</button>
							</div>
						</div>
						<div className="post-content">
							<div className="content-left">
								<img
									src={`http://localhost:5000${rating.imageUrl}`}
									alt={rating.name}
								/>
							</div>
							<div className="content-right">
								<div className="content-ratings">
									{Array.from(
										{ length: rating.rating },
										(_, index) => (
											<img
												key={index}
												src="src/assets/star.png"
												alt="star"
												className="rating-star"
											/>
										)
									)}
								</div>
								<div className="content-description">
									<h2>My Review:</h2>
									<p>{rating.reviewText} </p>
								</div>
							</div>
						</div>
                        </div>
                    ))}

                    {/* Map through user polls */}
                    {userPolls.map((poll) => (
                        <div className="my-polls-card" key={poll._id}>
                            {/* Poll Title */}
						<div className="poll-header">
							<h2 className="poll-title">POLL: {poll.question}</h2>
						</div>
                        

						{/* Poll Instructions */}
						<p className="poll-instruction">-Select one option-</p>

						{/* Poll Options */}
						<div className="poll-options">
							{poll.options.map((option, index) => (
								<button
									key={index}
									className="poll-option"
									onClick={() => handleVoteClick(poll._id, index)} // Connect the poll voting handler
								>
									{option}
								</button>
							))}
						</div>

						{/* Poll Footer */}
						<div className="poll-footer">
							<p>
								{/* Perform reduce only if poll.votes is not undefined */}
								{poll.votes ? poll.votes.reduce((a, b) => a + b, 0) : 0} Votes - Poll ends{" "}
								{new Date(poll.endDate).toLocaleDateString()}
							</p>
						</div>
                        </div>
                    ))}
                </>
            )}
        </div>
    </div>
);
};

export default MyPosts;
