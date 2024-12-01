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

	// Handler for voting on a poll option
	const handleVoteClick = async (pollId, optionIndex) => {
		try {
			const response = await axios.put(
				"http://localhost:5000/polls/vote",
				{
					pollID: pollId,
					optionIndex: optionIndex,
				}
			);

			if (response.status === 200) {
				toast.success("Vote submitted successfully!");
				setPoll(response.data.updatedPoll);
			}
		} catch (err) {
			console.error("Failed to submit vote:", err);
			toast.error("Failed to submit vote. Please try again.");
		}
	};

	useEffect(() => {
		const checkIfSaved = async () => {
			try {
				const userID = localStorage.getItem("userId");
				const response = await axios.get(
					`http://localhost:5000/auth/savedPosts?userID=${userID}`
				);
				const saved = response.data.savedPosts.some(
					(post) => post.postType === "poll" && post.postId._id === id
				);
				setIsSaved(saved);
			} catch (err) {
				console.error("Error checking saved status:", err);
			}
		};
		checkIfSaved();
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
			position: "top-right",
			autoClose: 100,
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

	return (
		<div className="poll-post-container">
			<div className="poll-card">
				<div className="poll-header">
					<div className="poll-votes">
						<img
							id="upvote-arrow"
							src="/src/assets/up-arrow.png"
							alt="upvote"
							style={{ transform: "rotate(100)" }}
						/>
						<img
							id="downvote-arrow"
							src="/src/assets/down-arrow.png"
							alt="downvote"
						/>
					</div>
					<div className="poll-right">
						<ExternalLink
							onClick={copyToClipboard}
							className="share-icon"
							size={25}
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
						{poll.options.map((option, index) => (
							<button
								key={index}
								className="poll-option"
								onClick={() => handleVoteClick(poll._id, index)}
							>
								{option}
							</button>
						))}
					</div>
					<div className="poll-footer">
						<p>
							{poll.votes
								? poll.votes.reduce((a, b) => a + b, 0)
								: 0}{" "}
							Votes - Poll ends{" "}
							{new Date(poll.endDate).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export default PollPost;
