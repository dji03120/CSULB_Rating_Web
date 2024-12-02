import React, { useEffect, useState } from "react";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyPosts.css";

// Component to access a user's posts
const MyPosts = () => {
	const [userRatings, setUserRatings] = useState([]);
	const [userPolls, setUserPolls] = useState([]);
	const [polls, setPolls] = useState([]); // State for poll data
	const [loading, setLoading] = useState(true); // State to track loading status
	const [savedPosts, setSavedPosts] = useState([]);
	const [activeTab, setActiveTab] = useState("ratings"); // State to track the active tab
	const [userVotedPolls, setUserVotedPolls] = useState([]); // Track polls user has voted in
	const [votedPosts, setVotedPosts] = useState({});

	useEffect(() => {
		const userID = localStorage.getItem("userId"); // Gets the current user's id

		// Fetches the user's ratings
		const fetchUserRatings = async () => {
			setLoading(true); // Sets loading to true before making the request
			try {
				const response = await axios.get(
					"http://localhost:5000/ratings/my-ratings",
					{
						params: { userID },
					}
				);
				setUserRatings(response.data); // Sets the user's ratings

				const savedPostsResponse = await axios.get(
					`http://localhost:5000/auth/savedPosts?userID=${userID}`
				);
				console.log(
					"Fetched Saved Posts:",
					savedPostsResponse.data.savedPosts
				);
				setSavedPosts(savedPostsResponse.data.savedPosts);
			} catch (err) {
				console.error("Error fetching user ratings:", err);
			} finally {
				setLoading(false); // Sets loading to false after the request is done
			}
		};
		fetchUserRatings();

		// Fetches the user's polls
		const fetchUserPolls = async () => {
			setLoading(true);
			try {
				const response = await axios.get(
					"http://localhost:5000/polls/my-polls",
					{
						params: { userID },
					}
				);
				// Get voted polls from localStorage
				const userVotedPolls =
					JSON.parse(localStorage.getItem("userVotedPolls")) || [];

				// Add hasVoted property to each poll
				const updatedPolls = response.data.map((poll) => ({
					...poll,
					hasVoted: userVotedPolls.includes(poll._id),
				}));

				setUserPolls(updatedPolls);
			} catch (err) {
				console.error("Error fetching user polls:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchUserPolls();

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
	}, []);

	// Deletes the user's rating
	const deleteRating = async (id) => {
		const confirmDeletion = window.confirm(
			"Are you sure you want to delete this rating?"
		);
		if (!confirmDeletion) {
			return; // Exit if user cancels
		}

		try {
			await axios.delete(`http://localhost:5000/ratings/${id}`);
			setUserRatings((prevRatings) =>
				prevRatings.filter((rating) => rating._id !== id)
			);
		} catch (err) {
			console.error("Error deleting rating:", err);
		}
	};

	// Deletes the user's poll
	const deletePoll = async (id) => {
		const confirmDeletion = window.confirm(
			"Are you sure you want to delete this poll?"
		);
		if (!confirmDeletion) {
			return; // Exit if user cancels
		}
		try {
			await axios.delete(`http://localhost:5000/polls/${id}`);
			setUserPolls((prevPolls) =>
				prevPolls.filter((poll) => poll._id !== id)
			);
		} catch (err) {
			console.error("Error deleting poll:", err);
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

	const copyToClipboard = (postType, postId) => {
		const shareLink = `${window.location.origin}/${postType}/${postId}`;
		navigator.clipboard
			.writeText(shareLink)
			.then(() => {
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
			})
			.catch((err) => {
				console.error("Clipboard write failed:", err);
			});
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

	// Handler for voting on a poll option
	const handleVoteClick = async (pollId, optionIndex) => {
		if (userVotedPolls.includes(pollId)) {
			toast.error("You have already voted in this poll.", {
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

		try {
			const response = await axios.put(
				"http://localhost:5000/polls/vote",
				{
					pollID: pollId,
					optionIndex: optionIndex,
					userID: localStorage.getItem("userId"),
				}
			);

			if (response.status === 200) {
				setUserPolls((prevPolls) =>
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
			// console.error("Failed to submit vote:", err);
			toast.error("You have already voted in this poll.", {
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
					setUserRatings((prev) =>
						prev.map((rating) =>
							rating._id === postId
								? response.data.updatedPost
								: rating
						)
					);
				} else {
					setPolls((prev) =>
						prev.map((poll) =>
							poll._id === postId
								? response.data.updatedPost
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

	// Returns the user's posts
	return (
		<div className="my-posts-content">
			<h1 className="my-posts-page-title">My Posts</h1>

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

			<div className="tab-content">
				{activeTab === "ratings" && (
					<div>
						{/* Map through user ratings */}
						{userRatings.map((rating) => (
							<div key={rating._id} className="post-card">
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
											size={25}
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
										<button
											onClick={() =>
												deleteRating(rating._id)
											}
										>
											Delete
										</button>
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

				{activeTab === "polls" && (
					<div>
						{/* Map through user polls */}
						{userPolls.map((poll) => (
							<div key={poll._id} className="poll-card">
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
											size={25}
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
										<button
											onClick={() => deletePoll(poll._id)}
										>
											Delete
										</button>
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
											{/* Perform reduce only if poll.votes is not undefined */}
											{poll.votes
												? poll.votes.reduce(
														(a, b) => a + b,
														0
												  )
												: 0}{" "}
											Votes - Poll ends{" "}
											{new Date(
												poll.endDate
											).toLocaleDateString()}
										</p>
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

export default MyPosts;
