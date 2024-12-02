import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Bookmarks.css";
import { ExternalLink } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Component to access a user's saved posts
const Bookmarks = () => {
	const [savedPosts, setSavedPosts] = useState([]);
	const [savedRatings, setSavedRatings] = useState([]);
	const [savedPolls, setSavedPolls] = useState([]);
	const [activeTab, setActiveTab] = useState("rating"); // State to track active tab
	const [userVotedPolls, setUserVotedPolls] = useState([]); // Track polls user has voted in
	const [votedPosts, setVotedPosts] = useState({});

	useEffect(() => {
		const fetchBookmarks = async () => {
			try {
				const userID = localStorage.getItem("userId");
				const response = await axios.get(
					`http://localhost:5000/auth/savedPosts?userID=${userID}`
				);

				// Get saved posts
				const savedPollPosts = response.data.savedPosts.filter(
					(post) => post.postType === "poll" && post.postId
				);

				// If there are saved polls, fetch their full data
				if (savedPollPosts.length > 0) {
					// Get voted polls from localStorage
					const userVotedPolls =
						JSON.parse(localStorage.getItem("userVotedPolls")) ||
						[];

					// Update each poll with hasVoted property
					const updatedSavedPosts = response.data.savedPosts.map(
						(post) => {
							if (post.postType === "poll" && post.postId) {
								return {
									...post,
									postId: {
										...post.postId,
										hasVoted: userVotedPolls.includes(
											post.postId._id
										),
									},
								};
							}
							return post;
						}
					);

					setSavedPosts(updatedSavedPosts);
				} else {
					setSavedPosts(response.data.savedPosts);
				}
			} catch (err) {
				console.error("Failed to fetch bookmarks:", err);
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
		fetchBookmarks();
	}, []);

	const handleUnsaveClick = async (postType, postId) => {
		try {
			const userID = localStorage.getItem("userId");

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
							post.postId &&
							post.postId._id === postId.toString()
						)
				)
			);
		} catch (err) {
			console.error("Failed to unsave post:", err);
		}
	};

	const handleVoteClick = async (pollId, optionIndex) => {
		if (userVotedPolls.includes(pollId)) {
			alert("You have already voted on this poll.");
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
				setSavedPosts((prev) =>
					prev.map((post) => {
						if (post.postId?._id === pollId) {
							return {
								...post,
								postId: {
									...post.postId,
									hasVoted: true,
									votes: response.data.updatedPoll.votes,
								},
							};
						}
						return post;
					})
				);

				const updatedVotedPolls = [...userVotedPolls, pollId];
				setUserVotedPolls(updatedVotedPolls);
				localStorage.setItem(
					"userVotedPolls",
					JSON.stringify(updatedVotedPolls)
				);
			}
		} catch (err) {
			console.error("Failed to submit vote:", err);
			alert("Failed to submit vote. Please try again.");
		}
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
					setSavedPosts((prev) =>
						prev.map((rating) =>
							rating._id === postId
								? response.data.updatedPost
								: rating
						)
					);
				} else {
					setSavedPolls((prev) =>
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
			// toast.error("Failed to vote. Please try again.");
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
											src={`src/assets/${
												votedPosts[postId._id] === "up"
													? "up-arrow.png"
													: "grayed-up-arrow.png"
											}`}
											alt="upvote"
											onClick={() =>
												handleVote(
													postId._id,
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
												votedPosts[postId._id] ===
												"down"
													? "down-arrow.png"
													: "grayed-down-arrow.png"
											}`}
											alt="downvote"
											onClick={() =>
												handleVote(
													postId._id,
													"rating",
													"down"
												)
											}
											style={{ cursor: "pointer" }}
										/>
									</div>
									<div className="post-title">
										<h1>{postId.name}</h1>
									</div>
									<div className="post-right">
										<ExternalLink
											onClick={() =>
												copyToClipboard(
													"rating",
													postId._id
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
											src="src/assets/heart.png"
											alt="like-icon"
											className="post-heart"
											onClick={() =>
												handleUnsaveClick(
													"rating",
													postId._id
												)
											}
										/>
									</div>
								</div>
								<div className="post-content">
									<div className="content-left">
										{postId.imageUrl ? (
											<img
												src={`http://localhost:5000${postId.imageUrl}`}
												alt={postId.name}
											/>
										) : (
											<img
												src={`/src/assets/no-image-placeholder.png`}
												alt={postId.name}
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
												{ length: postId.rating },
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
											<p>{postId.reviewText}</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{postType === "poll" && (
							<div className="saved-poll-card">
								<div className="poll-header">
									<div className="post-votes">
										<img
											id="upvote-arrow"
											src={`src/assets/${
												votedPosts[postId._id] === "up"
													? "up-arrow.png"
													: "grayed-up-arrow.png"
											}`}
											alt="upvote"
											onClick={() =>
												handleVote(
													postId._id,
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
												votedPosts[postId._id] ===
												"down"
													? "down-arrow.png"
													: "grayed-down-arrow.png"
											}`}
											alt="downvote"
											onClick={() =>
												handleVote(
													postId._id,
													"poll",
													"down"
												)
											}
											style={{ cursor: "pointer" }}
										/>
									</div>
									<div className="poll-right">
										{/* Show "Voted" badge only if user has voted */}
										{postId.hasVoted && (
											<span className="voted-badge">
												Voted
											</span>
										)}
										<ExternalLink
											onClick={() =>
												copyToClipboard(
													"poll",
													postId._id
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
											src="src/assets/heart.png"
											alt="like-icon"
											className="post-heart"
											onClick={() =>
												handleUnsaveClick(
													"poll",
													postId._id
												)
											}
										/>
									</div>
								</div>
								<div className="poll-content">
									<div className="poll-title">
										<h1>Poll: {postId.question}</h1>
									</div>
									<p className="poll-instruction">
										Select one option:
									</p>
									<div className="poll-options">
										{postId.options.map((option, index) => {
											const totalVotes =
												postId.votes.reduce(
													(a, b) => a + b,
													0
												); // Calculate total votes
											const optionVotes =
												postId.votes[index]; // Get votes for the option
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
												new Date(postId.endDate) < now; // Check if poll is ended

											return (
												<div
													key={index}
													className="poll-option-container"
												>
													{/* Option Button */}
													<button
														disabled={
															postId.hasVoted ||
															isPollEnded
														} // Disabled when it is voted or has ended
														onClick={() =>
															handleVoteClick(
																postId._id,
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
									<div className="poll-footer">
										{/* Poll ended message */}
										{new Date(postId.endDate).setHours(
											0,
											0,
											0,
											0
										) < new Date().setHours(0, 0, 0, 0) ? (
											<p className="poll-ended-message">
												This poll has ended.
											</p>
										) : (
											// Still voting
											// <p>
											// 	{postId.votes.reduce(
											// 		(a, b) => a + b,
											// 		0
											// 	)}{" "}
											// 	Votes - Poll ends{" "}
											// 	{new Date(
											// 		postId.endDate
											// 	).toLocaleDateString()}
											// </p>
											<p>
												{postId.votes
													? postId.votes.reduce(
															(a, b) => a + b,
															0
													  )
													: 0}{" "}
												Votes - Poll ends{" "}
												{formatPollDate(postId.endDate)}
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

			<div className="saved-posts-list">{renderSavedPosts()}</div>
			<ToastContainer />
		</div>
	);
};

export default Bookmarks;
