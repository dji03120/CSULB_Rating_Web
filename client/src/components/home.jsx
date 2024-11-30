import React, { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";

export const Home = () => {
	const navigate = useNavigate();
	const [ratings, setRatings] = useState([]); // State for ratings data
	const [polls, setPolls] = useState([]); // State for poll data
	const [searchQuery, setSearchQuery] = useState("");  // State for search query
	const [finalSearchQuery, setFinalSearchQuery] = useState("");  // State for final search query that will be submitted
	const [savedPosts, setSavedPosts] = useState([]);
	const [activeTab, setActiveTab] = useState("ratings");  // State to track active tab
	const [userVotedPolls, setUserVotedPolls] = useState([]); // Track polls user has voted in


	useEffect(() => {
		const fetchData = async () => {
			try {
				const userID = localStorage.getItem("userId");
	
				// Fetch ratings
				const ratingResponse = await axios.get("http://localhost:5000/ratings");
				setRatings(ratingResponse.data);
	
				// Fetch polls with userID for hasVoted
				const pollResponse = await axios.get("http://localhost:5000/polls", {
					params: { userID }, // Send userID to server
				});
	
				// Update polls with the 'hasVoted' information
				const updatedPolls = pollResponse.data.map((poll) => {
					return {
						...poll,
						hasVoted: poll.voters.includes(userID),
					};
				});
				setPolls(updatedPolls);
	
				// Retrieve voted polls from localStorage
				const votedPolls = JSON.parse(localStorage.getItem("userVotedPolls")) || [];
				setUserVotedPolls(votedPolls);
	
				// Fetch saved posts
				const savedPostsResponse = await axios.get(
					`http://localhost:5000/auth/savedPosts?userID=${userID}`
				);
				setSavedPosts(savedPostsResponse.data.savedPosts);
			} catch (err) {
				console.error("Failed to fetch data:", err);
			}
		};
	
		fetchData();
	}, []);	

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
				setPolls((prevPolls) =>
					prevPolls.map((poll) =>
						poll._id === pollId
							? { ...poll, hasVoted: true, votes: response.data.updatedPoll.votes }
							: poll
					)
				);
	
				// Update voted polls in localStorage and state
				const updatedVotedPolls = [...userVotedPolls, pollId];
				setUserVotedPolls(updatedVotedPolls);
				localStorage.setItem("userVotedPolls", JSON.stringify(updatedVotedPolls));
			}
		} catch (err) {
			console.error("Failed to submit vote:", err);
			alert("Failed to submit vote. Please try again.");
		}
	};	
	

	// Check if a post is saved
	const isPostSaved = (postType, postId) => {
		const result = savedPosts.some(
			(post) =>
				post.postType === postType &&
				post.postId && // Ensure postId is not null
				post.postId._id === postId.toString()
		);
		console.log(`Checking (${postType}, ${postId}):`, result);
		return result;
	};
		

	// Toggle save/unsave functionality
	const handleSaveClick = async (postType, postId) => {
		try {
			const userID = localStorage.getItem("userId");
			const isSaved = isPostSaved(postType, postId); // Check if it's saved or not
	
			if (isSaved) {
				// Remove from saved posts
				await axios.put(`http://localhost:5000/auth/unsavePost?userID=${userID}`, {
					postType,
					postId,
				});
	
				// Update the state
				setSavedPosts((prev) =>
					prev.filter(
						(post) =>
							post.postType !== postType ||
							!post.postId ||
							post.postId._id !== postId.toString()
					)
				);
			} else {
				// Add to saved posts
				const response = await axios.put(
					`http://localhost:5000/auth/savePost?userID=${userID}`,
					{ postType, postId }
				);
				if (response.status === 200) {
					// Update the state
					setSavedPosts((prev) => [
						...prev,
						{ postType, postId: { _id: postId }, _id: response.data.savedPostId },
					]);
				}
			}
		} catch (err) {
			console.error("Failed to toggle save post:", err);
		}
	};	
	

	// Filters the ratings based on words in its name
	const filteredRatings = ratings.filter(
		(rating) =>
			rating.name.toLowerCase().includes(finalSearchQuery.toLowerCase())
	);

	// Filters the polls based on words in its question
	const filteredPolls = polls.filter(
		(poll) =>
			poll.question.toLowerCase().includes(finalSearchQuery.toLowerCase())
	)

	// If the user presses "Enter", the search will go through
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			setFinalSearchQuery(searchQuery);
		}
	};

	// Handles search for when search button is pressed
	const handleSearchClick = () => {
		setFinalSearchQuery(searchQuery);
	};

	// Clears search by resetting search queries
	const clearSearch = () => {
		setSearchQuery("");
		setFinalSearchQuery("");
	}

	return (
		<div className="home-container">
			<div className="search-bar-container">
				<input
					type="text"
					placeholder="Search" 
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<img
					id="search-button"
					src="src/assets/search.png"
					onClick={handleSearchClick}
				/>
			</div>

			{/* Displays Clear Search button if final query is not empty */}
			{finalSearchQuery && (
				<button
					className="clear-search-button" 
					onClick={clearSearch}>
					Clear Search
				</button>
			)}
			<div className="home-content">
				<span className="home-header">New Ratings & Polls</span>

				{/* Tab Navigation */}
				<div className="tabs">
					<button
						className={`tab ${activeTab === "ratings" ? "active" : ""}`}
						onClick={() => setActiveTab("ratings")}
					>
					Ratings
					</button>
					<button
						className={`tab ${activeTab === "polls" ? "active" : ""}`}
						onClick={() => setActiveTab("polls")}
					>
					Polls
					</button>
				</div>

				{/* Ratings Tab */}
				{activeTab === "ratings" && (
					<div className="ratings-tab">
						{filteredRatings.map((rating) => (
							<div key={rating._id} className="post-card">
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
											src={
												isPostSaved("rating", rating._id)
													? "src/assets/heart.png" // Show filled heart if saved
													: "src/assets/grayed-heart.png" // Show gray heart if not saved
											}
											alt="like-icon"
											className="post-heart"
											onClick={() => handleSaveClick("rating", rating._id)}
										/>
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
					</div>
				)}
				

				{/* Polls Tab */}
				{activeTab === "polls" && (
					<div className="polls-tab">
						{filteredPolls.map((poll) => (
							<div key={poll._id} className="poll-card">
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
											style={{}}
										/>
									</div>
									<div className="poll-right">
										{/* Show "Voted" badge only if user has voted */}
										{poll.hasVoted && <span className="voted-badge">Voted</span>}
										{/* Always show the "Share" button */}
										<button>Share</button>
										<img
											src={
												isPostSaved("poll", poll._id)
													? "src/assets/heart.png" // Show filled heart if saved
													: "src/assets/grayed-heart.png" // Show gray heart if not saved
											}
											alt="like-icon"
											className="post-heart"
											onClick={() => handleSaveClick("poll", poll._id)}
										/>
									</div>
								</div>
								<div className="poll-content">
									<div className="poll-title">
										<h1>Poll: {poll.question}</h1>
									</div>
									{/* Poll Instructions */}
									<p className="poll-instruction">Select one option:</p>

									{/* Poll Options */}
									<div className="poll-options">
										{poll.options.map((option, index) => {
											const totalVotes = poll.votes.reduce((a, b) => a + b, 0); // Calculate total votes
											const optionVotes = poll.votes[index]; // Get votes for the option
											const percentage = totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(1) : "0.0"; // Calculate percentage

											const now = new Date(); // Current time
											const isPollEnded = new Date(poll.endDate) < now; // check if poll is ended

											return (
												<div key={index} className="poll-option-container">
													{/* Option Button */}
													<button
														disabled={poll.hasVoted || isPollEnded} // disabled when it is voted or has ended
														onClick={() => handleVoteClick(poll._id, index)}>
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

									{/* Poll Footer */}
									<div className="poll-footer">
										{/* Poll ended message */}
										{new Date(poll.endDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
											<p className="poll-ended-message">This poll has ended.</p>
										) : (
											// Still voting
											<p>
												{poll.votes.reduce((a, b) => a + b, 0)} Votes - Poll ends {new Date(poll.endDate).toLocaleDateString()}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};