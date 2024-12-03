import React, { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Home = () => {
	const navigate = useNavigate();
	const [ratings, setRatings] = useState([]); // State for ratings data
	const [polls, setPolls] = useState([]); // State for poll data
	const [searchQuery, setSearchQuery] = useState(""); // State for search query
	const [finalSearchQuery, setFinalSearchQuery] = useState(""); // State for final search query that will be submitted
	const [savedPosts, setSavedPosts] = useState([]);
	const [userVotedPolls, setUserVotedPolls] = useState([]); // Track polls user has voted in
	const [shareOptions, setShareOptions] = useState(null); // Track the post for which share options are open
	const [activeTab, setActiveTab] = useState("ratings"); // State to track active tab
	const [votedPosts, setVotedPosts] = useState({});
	const [hideLowRatedPosts, setHideLowRatedPosts] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userID = localStorage.getItem("userId");

				// Fetch ratings
				const ratingResponse = await axios.get(
					"http://localhost:5000/ratings"
				);
				setRatings(ratingResponse.data);

				// Fetch polls
				const pollResponse = await axios.get(
					"http://localhost:5000/polls",
					{
						params: { userID },
					}
				);

				const updatedPolls = pollResponse.data.map((poll) => ({
					...poll,
					hasVoted: poll.voters.includes(userID),
				}));
				setPolls(updatedPolls);

				// Retrieve voted polls from localStorage
				const votedPolls =
					JSON.parse(localStorage.getItem("userVotedPolls")) || [];
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

		const fetchVoteStates = async () => {
			try {
				const userID = localStorage.getItem("userId");
				const response = await axios.get(
					`http://localhost:5000/auth/votes?userID=${userID}`
				);
				setVotedPosts(response.data.votes);
			} catch (err) {
				console.error("Failed to fetch vote states:", err);
			}
		};

		fetchVoteStates();
		fetchData();
	}, []);

	const handleShareClick = (postType, postId) => {
		setShareOptions(
			shareOptions?.postId === postId ? null : { postType, postId }
		);
	};

	const shareToPlatform = (platform, postType, postId) => {
		const shareUrl = `${window.location.origin}/${postType}/${postId}`;
		const encodedUrl = encodeURIComponent(shareUrl);

		switch (platform) {
			case "facebook":
				window.open(
					`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
					"_blank"
				);
				break;
			case "twitter":
				window.open(
					`https://twitter.com/share?url=${encodedUrl}`,
					"_blank"
				);
				break;
			case "linkedin":
				window.open(
					`https://www.linkedin.com/shareArticle?url=${encodedUrl}`,
					"_blank"
				);
				break;
			case "email":
				window.location.href = `mailto:?subject=Check this out&body=${encodedUrl}`;
				break;
			default:
				alert("Unsupported platform");
		}

		setShareOptions(null); // Close the share options after selecting a platform
	};

	// Handler for voting on a poll option
	const handleVoteClick = async (pollId, optionIndex) => {
		const userId = localStorage.getItem("userId"); // Check if user is logged in

		// If the user is not logged in, show a toast notification and redirect to the login page.
		if (!userId) {
			toast.error("Please log in to vote on this poll.", {
				position: "bottom-right",
				autoClose: 1500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
			navigate("/login"); // Redirect to login page
			return;
		}
		// If the user has already voted on this poll, show an error toast notification.
		if (userVotedPolls.includes(pollId)) {
			toast.error("You have already voted on this poll.", {
				position: "bottom-right",
				autoClose: 1500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
			return;
		}
		// Attempt to send the vote to the backend API.
		try {
			const response = await axios.put(
				"http://localhost:5000/polls/vote",
				{
					pollID: pollId,
					optionIndex: optionIndex,
					userID: userId,
				}
			);
			// If the vote submission is successful, show a success toast notification.
			if (response.status === 200) {
				toast.success("Vote submitted successfully!", {
					position: "bottom-right",
					autoClose: 1500,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
					progress: undefined,
					theme: "light",
				});

				// Update polls state with new vote count and mark as voted
				setPolls((prevPolls) =>
					prevPolls.map((poll) =>
						poll._id === pollId
							? {
									...poll,
									hasVoted: true,
									votes: response.data.updatedPoll.votes,
							  }
							: poll
					)
				);

				// Update voted polls in localStorage and state
				const updatedVotedPolls = [...userVotedPolls, pollId];
				setUserVotedPolls(updatedVotedPolls);
				localStorage.setItem(
					"userVotedPolls",
					JSON.stringify(updatedVotedPolls)
				);
			}
		} catch (err) {
			// Handle any errors that occur during the vote submission process.
			console.error("Failed to submit vote:", err);
			toast.error("Failed to submit vote. Please try again.", {
				position: "bottom-right",
				autoClose: 1500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
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
		// console.log(`Checking (${postType}, ${postId}):`, result);
		return result;
	};

	// Toggle save/unsave functionality
	const handleSaveClick = async (postType, postId) => {
		try {
			const userID = localStorage.getItem("userId");
			const isSaved = isPostSaved(postType, postId); // Check if it's saved or not
			if (isSaved) {
				// Remove from saved posts
				await axios.put(
					`http://localhost:5000/auth/unsavePost?userID=${userID}`,
					{
						postType,
						postId,
					}
				);

				// Update the state
				setSavedPosts((prev) =>
					prev.filter(
						(post) =>
							!(
								post.postType === postType &&
								post.postId && // Ensure postId is not null
								post.postId._id === postId.toString()
							)
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
						{
							postType,
							postId: { _id: postId },
							_id: response.data.savedPostId,
						},
					]);
				}
			}
		} catch (err) {
			console.error("Failed to toggle save post:", err);
		}
	};

	// Filters the ratings based on words in its name
	// const filteredRatings = ratings.filter((rating) =>
	// 	rating.name.toLowerCase().includes(finalSearchQuery.toLowerCase())
	// );

	const filteredRatings = ratings
		.filter((rating) =>
			rating.name.toLowerCase().includes(finalSearchQuery.toLowerCase())
		)
		.filter((rating) => {
			if (hideLowRatedPosts) {
				return rating.downvotes < 3;
			}
			return true;
		});

	// Filters the polls based on words in its question
	// const filteredPolls = polls.filter((poll) =>
	// 	poll.question.toLowerCase().includes(finalSearchQuery.toLowerCase())
	// );

	const filteredPolls = polls
		.filter((poll) =>
			poll.question.toLowerCase().includes(finalSearchQuery.toLowerCase())
		)
		.filter((poll) => {
			if (hideLowRatedPosts) {
				return poll.downvotes < 3;
			}
			return true;
		});

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
	};

	const copyToClipboard = (postType, postId) => {
		const shareLink = `${window.location.origin}/${postType}/${postId}`;
		navigator.clipboard.writeText(shareLink);
		toast.success("Link copied to clipboard!", {
			position: "bottom-right",
			autoClose: 1500,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
			progress: undefined,
			theme: "light",
		});
	};

	const handleVote = async (postId, postType, voteType) => {
		try {
			const userID = localStorage.getItem("userId");
			const currentVote = votedPosts[postId];

			// Determine new vote state
			let newVoteType = null;
			if (currentVote === voteType) {
				// Clicking same button again removes vote
				newVoteType = null;
			} else {
				// Set new vote type
				newVoteType = voteType;
			}

			const response = await axios.put(
				`http://localhost:5000/auth/vote`,
				{
					postId,
					postType,
					voteType: newVoteType,
					userID,
				}
			);

			if (response.status === 200) {
				// Update local vote state
				setVotedPosts((prev) => ({
					...prev,
					[postId]: newVoteType,
				}));

				// Update posts with new vote counts
				if (postType === "rating") {
					setRatings((prev) =>
						prev.map((rating) =>
							rating._id === postId
								? response.data.updatedPost
								: rating
						)
					);
				} else {
					// setPolls((prev) =>
					// 	prev.map((poll) =>
					// 		poll._id === postId
					// 			? response.data.updatedPost
					// 			: poll
					// 	)
					// );
					setPolls((prev) =>
						prev.map((poll) =>
							poll._id === postId
								? {
										...poll,
										...response.data.updatedPost,
										hasVoted: poll.hasVoted, // Preserve hasVoted
								  }
								: poll
						)
					);
				}
			}
		} catch (err) {
			console.error("Failed to vote:", err);
			toast.error("Failed to vote. Please try again.");
		}
	};

	const formatPollDate = (dateString) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			timeZone: "UTC", // Ensure consistent timezone handling
		});
	};

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
				<button className="clear-search-button" onClick={clearSearch}>
					Clear Search
				</button>
			)}
			<div className="home-content">
				<span className="home-header">New Ratings & Polls</span>

				{/* Tab Navigation */}
				<div className="tabs">
					<button
						className={`tab ${
							activeTab === "ratings" ? "active" : ""
						}`}
						onClick={() => setActiveTab("ratings")}
					>
						Ratings
					</button>
					<button
						className={`tab ${
							activeTab === "polls" ? "active" : ""
						}`}
						onClick={() => setActiveTab("polls")}
					>
						Polls
					</button>
				</div>
				{!finalSearchQuery && (
					<div className="toggle-switch">
						<input
							type="checkbox"
							id="filter-toggle"
							checked={hideLowRatedPosts}
							onChange={() =>
								setHideLowRatedPosts(!hideLowRatedPosts)
							}
						/>
						<label htmlFor="filter-toggle"></label>
						<span>
							{hideLowRatedPosts
								? "Show All Posts"
								: "Hide Posts with ≥3 Downvotes"}
						</span>
					</div>
				)}

				{/* Ratings Tab */}
				{activeTab === "ratings" && (
					<div className="ratings-tab">
						{filteredRatings.map((rating) => (
							<div key={rating._id} className="post-card">
								{/* <div className="vote-counts">
									<span>Upvotes: {rating.upvotes}</span>
									<span>Downvotes: {rating.downvotes}</span>
								</div> */}
								<div className="post-header">
									<div className="post-votes">
										<img
											id="upvote-arrow"
											src={`src/assets/${
												votedPosts[rating._id] === "up"
													? "up-arrow.png"
													: "grayed-up-arrow.png"
											}`}
											alt="upvote"
											onClick={() =>
												handleVote(
													rating._id,
													"rating",
													"up"
												)
											}
											style={{
												transform: "rotate(100)",
												cursor: "pointer",
											}}
										/>
										<img
											id="downvote-arrow"
											src={`src/assets/${
												votedPosts[rating._id] ===
												"down"
													? "down-arrow.png"
													: "grayed-down-arrow.png"
											}`}
											alt="downvote"
											onClick={() =>
												handleVote(
													rating._id,
													"rating",
													"down"
												)
											}
											style={{ cursor: "pointer" }}
										/>
									</div>
									<div className="post-title">
										<h1>{rating.name}</h1>
									</div>
									<div className="post-right">
										<ExternalLink
											onClick={() =>
												copyToClipboard(
													"rating",
													rating._id
												)
											}
											className="share-icon"
											size={40}
											style={{
												cursor: "pointer",
												color: "pink",
											}}
										/>
										<img
											src={
												isPostSaved(
													"rating",
													rating._id
												)
													? "src/assets/heart.png" // Show filled heart if saved
													: "src/assets/grayed-heart.png" // Show gray heart if not saved
											}
											alt="like-icon"
											className="post-heart"
											onClick={() =>
												handleSaveClick(
													"rating",
													rating._id
												)
											}
										/>
									</div>
								</div>
								<div className="post-content">
									<div className="content-left">
										{rating.imageUrl ? (
											<img
												src={`http://localhost:5000${rating.imageUrl}`}
												alt={rating.name}
											/>
										) : (
											<img
												src={`/src/assets/no-image-placeholder.png`}
												alt={rating.name}
												style={{
													width: "80%",
													objectFit: "contain",
												}}
											/>
										)}
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
								{/* <div className="vote-counts">
									<span>Upvotes: {poll.upvotes}</span>
									<span>Downvotes: {poll.downvotes}</span>
								</div> */}
								<div className="poll-header">
									<div className="post-votes">
										<img
											id="upvote-arrow"
											src={`src/assets/${
												votedPosts[poll._id] === "up"
													? "up-arrow.png"
													: "grayed-up-arrow.png"
											}`}
											alt="upvote"
											onClick={() =>
												handleVote(
													poll._id,
													"poll",
													"up"
												)
											}
											style={{
												transform: "rotate(100)",
												cursor: "pointer",
											}}
										/>
										<img
											id="downvote-arrow"
											src={`src/assets/${
												votedPosts[poll._id] === "down"
													? "down-arrow.png"
													: "grayed-down-arrow.png"
											}`}
											alt="downvote"
											onClick={() =>
												handleVote(
													poll._id,
													"poll",
													"down"
												)
											}
											style={{ cursor: "pointer" }}
										/>
									</div>
									<div className="poll-right">
										{/* Voted Badge */}
										{poll.hasVoted && (
											<span className="voted-badge">
												Voted
											</span>
										)}
										<ExternalLink
											onClick={() =>
												copyToClipboard(
													"poll",
													poll._id
												)
											}
											className="share-icon"
											size={40}
											style={{
												cursor: "pointer",
												color: "pink",
											}}
										/>
										<img
											src={
												isPostSaved("poll", poll._id)
													? "src/assets/heart.png" // Show filled heart if saved
													: "src/assets/grayed-heart.png" // Show gray heart if not saved
											}
											alt="like-icon"
											className="post-heart"
											onClick={() =>
												handleSaveClick(
													"poll",
													poll._id
												)
											}
										/>
									</div>
								</div>
								<div className="poll-content">
									<div className="poll-title">
										<h1>Poll: {poll.question}</h1>
									</div>
									{/* Poll Instructions */}
									<p className="poll-instruction">
										Select one option:
									</p>

									{/* Poll Options */}
									<div className="poll-options">
										{poll.options.map((option, index) => {
											const totalVotes =
												poll.votes.reduce(
													(a, b) => a + b,
													0
												); // Calculate total votes
											const optionVotes =
												poll.votes[index]; // Get votes for the option
											const percentage =
												totalVotes > 0
													? (
															(optionVotes /
																totalVotes) *
															100
													  ).toFixed(1)
													: "0.0"; // Calculate percentage

											const now = new Date(); // Current time
											const isPollEnded =
												new Date(poll.endDate) < now; // check if poll is ended

											return (
												<div
													key={index}
													className="poll-option-container"
												>
													{/* Option Button */}
													<button
														onClick={() =>
															handleVoteClick(
																poll._id,
																index
															)
														}
													>
														{option}
													</button>

													{/* Show Results */}
													<div className="poll-results">
														<div
															className="poll-bar"
															style={{
																width: `${Math.max(
																	percentage,
																	1
																)}%`,
																background: `linear-gradient(45deg, rgba(253, 18, 111, 0.2), rgba(255, 221, 0, 0.264), rgba(5, 209, 245, 0.2))`,
																height: "10px",
																marginTop:
																	"5px",
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
										<p>
											{poll.votes.reduce(
												(a, b) => a + b,
												0
											)}{" "}
											Votes - Poll ends{" "}
											{formatPollDate(poll.endDate)}
										</p>
										{new Date(poll.endDate) <
											new Date() && (
											<p
												style={{
													color: "red",
													fontWeight: "bold",
													fontSize: "17px",
													marginTop: "4px",
												}}
											>
												Poll has ended
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			<ToastContainer />
		</div>
	);
};
