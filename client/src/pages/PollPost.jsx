// PollPost.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PollPost.css";

const PollPost = () => {
	const [poll, setPoll] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isSaved, setIsSaved] = useState(false);
	const { id } = useParams();
	const [votedPosts, setVotedPosts] = useState({});

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

		try {
			const response = await axios.put(
				"http://localhost:5000/polls/vote",
				{
					pollID: pollId,
					optionIndex: optionIndex,
				}
			);

			if (response.status === 200) {
				toast.success("Vote submitted successfully!", {
					position: "top-right",
					autoClose: 1500,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
					progress: undefined,
					theme: "light",
				});
				setPoll(response.data.updatedPoll);
			}
		} catch (err) {
			console.error("Failed to submit vote:", err);
			toast.error("Failed to submit vote. You may have already voted on this poll.", {
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

	useEffect(() => {
		const checkIfSaved = async () => {
			try {
				const userID = localStorage.getItem("userId");
				const response = await axios.get(
					`http://localhost:5000/auth/savedPosts?userID=${userID}`
				);
				// Add null checks for savedPosts and postId
				const saved =
					response.data.savedPosts?.some(
						(post) =>
							post.postType === "poll" &&
							post.postId &&
							post.postId._id === id
					) || false;
				setIsSaved(saved);
			} catch (err) {
				console.error("Error checking saved status:", err);
				setIsSaved(false); // Set default state on error
			}
		};

		const fetchVoteStates = async () => {
			try {
				const userID = localStorage.getItem("userId");
				const response = await axios.get(
					`http://localhost:5000/auth/votes?userID=${userID}`
				);
				setVotedPosts(response.data.votes || {});
			} catch (err) {
				console.error("Failed to fetch vote states:", err);
				setVotedPosts({}); // Set default state on error
			}
		};

		if (localStorage.getItem("userId")) {
			// Only fetch if user is logged in
			fetchVoteStates();
			checkIfSaved();
		}
	}, [id]);

	const handleSaveClick = async () => {
		try {
			const userID = localStorage.getItem("userId");
			if (isSaved) {
				// Unsave post
				await axios.put(
					`http://localhost:5000/auth/unsavePost?userID=${userID}`,
					{
						postType: "poll",
						postId: id,
					}
				);
				toast.success("Poll unsaved!", {
					position: "bottom-right",
					autoClose: 1500,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
					progress: undefined,
					theme: "light",
				});
			} else {
				// Save post
				await axios.put(
					`http://localhost:5000/auth/savePost?userID=${userID}`,
					{
						postType: "poll",
						postId: id,
					}
				);
				toast.success("Poll saved!", {
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
			setIsSaved(!isSaved);
		} catch (err) {
			console.error("Failed to save/unsave poll:", err);
			toast.error("Failed to save/unsave poll");
		}
	};

	const copyToClipboard = () => {
		const shareLink = window.location.href;
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

	useEffect(() => {
		const fetchPoll = async () => {
			try {
				const response = await axios.get(
					`http://localhost:5000/polls/${id}`
				);
				setPoll(response.data);
			} catch (error) {
				console.error("Error fetching poll:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchPoll();
	}, [id]);

	if (loading) return <div>Loading...</div>;
	if (!poll) return <div>Poll not found</div>;

	const handleVote = async (postId, postType, voteType) => {
		try {
			const userID = localStorage.getItem("userId");
			const currentVote = votedPosts[postId];

			// Determine new vote state
			let newVoteType = null;
			if (currentVote === voteType) {
				newVoteType = null;
			} else {
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
				setVotedPosts((prev) => ({
					...prev,
					[postId]: newVoteType,
				}));

				// Update post data
				if (postType === "rating") {
					setRating(response.data.updatedPost);
				} else {
					setPoll(response.data.updatedPost);
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
		<div className="poll-post-container">
			<div className="poll-card">
				<div className="poll-header">
					<div className="post-votes">
						<img
							id="upvote-arrow"
							src={`/src/assets/${
								votedPosts[id] === "up"
									? "up-arrow.png"
									: "grayed-up-arrow.png"
							}`}
							alt="upvote"
							onClick={() => handleVote(id, "poll", "up")}
							style={{
								transform: "rotate(100)",
								cursor: "pointer",
							}}
						/>
						<img
							id="downvote-arrow"
							src={`/src/assets/${
								votedPosts[id] === "down"
									? "down-arrow.png"
									: "grayed-down-arrow.png"
							}`}
							alt="downvote"
							onClick={() => handleVote(id, "poll", "down")}
							style={{ cursor: "pointer" }}
						/>
					</div>
					<div className="post-right">
						{poll.hasVoted && (
							<span className="voted-badge">Voted</span>
						)}
						<ExternalLink
							onClick={copyToClipboard}
							className="share-icon"
							size={40}
							style={{ cursor: "pointer", color: "pink" }}
						/>
						<img
							src={
								isSaved
									? "/src/assets/heart.png"
									: "/src/assets/grayed-heart.png"
							}
							alt="like-icon"
							className="post-heart"
							onClick={handleSaveClick}
						/>
					</div>
				</div>
				<div className="poll-content">
					<div className="poll-title">
						<h1>Poll: {poll.question}</h1>
					</div>
					<p className="poll-instruction">Select one option:</p>
					<div className="poll-options">
						{poll.options.map((option, index) => {
							const totalVotes = poll.votes.reduce(
								(a, b) => a + b,
								0
							); // Calculate total votes
							const optionVotes = poll.votes[index]; // Get votes for the option
							const percentage =
								totalVotes > 0
									? (
											(optionVotes / totalVotes) *
											100
									  ).toFixed(1)
									: "0.0"; // Calculate percentage

							const now = new Date(); // Current time
							const isPollEnded = new Date(poll.endDate) < now; // check if poll is ended

							return (
								<div
									key={index}
									className="poll-option-container"
								>
									{/* Option Button */}
									<button
										disabled={poll.hasVoted || isPollEnded} // disabled when it is voted or has ended
										onClick={() =>
											handleVoteClick(poll._id, index)
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
						<p>
							{poll.votes
								? poll.votes.reduce((a, b) => a + b, 0)
								: 0}{" "}
							Votes - Poll ends {formatPollDate(poll.endDate)}
						</p>
					</div>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export default PollPost;
