// RatingPost.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ExternalLink } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RatingPost.css";

const RatingPost = () => {
	const [rating, setRating] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isSaved, setIsSaved] = useState(false);
	const { id } = useParams();
	const [votedPosts, setVotedPosts] = useState({});

	useEffect(() => {
		const checkIfSaved = async () => {
			try {
				const userID = localStorage.getItem("userId");
				const response = await axios.get(
					`http://https://csulb-api.onrender.com/auth/savedPosts?userID=${userID}`
				);
				const saved = response.data.savedPosts.some(
					(post) =>
						post.postType === "rating" && post.postId._id === id
				);
				setIsSaved(saved);
			} catch (err) {
				console.error("Error checking saved status:", err);
			}
		};

		const fetchVoteStates = async () => {
			try {
				const userID = localStorage.getItem("userId");
				const response = await axios.get(
					`http://https://csulb-api.onrender.com/auth/votes?userID=${userID}`
				);
				setVotedPosts(response.data.votes);
			} catch (err) {
				console.error("Failed to fetch vote states:", err);
			}
		};

		fetchVoteStates();
		checkIfSaved();
	}, [id]);

	const handleSaveClick = async () => {
		try {
			const userID = localStorage.getItem("userId");
			if (isSaved) {
				// Unsave post
				await axios.put(
					`http://https://csulb-api.onrender.com/auth/unsavePost?userID=${userID}`,
					{
						postType: "rating",
						postId: id,
					}
				);
				toast.success("Rating unsaved!", {
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
					`http://https://csulb-api.onrender.com/auth/savePost?userID=${userID}`,
					{
						postType: "rating",
						postId: id,
					}
				);
				toast.success("Rating saved!", {
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
			console.error("Failed to save/unsave rating:", err);
			toast.error("Failed to save/unsave rating");
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
		const fetchRating = async () => {
			try {
				const response = await axios.get(
					`http://https://csulb-api.onrender.com/ratings/${id}`
				);
				setRating(response.data);
			} catch (error) {
				console.error("Error fetching rating:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchRating();
	}, [id]);

	if (loading) return <div>Loading...</div>;
	if (!rating) return <div>Rating not found</div>;

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
				`http://https://csulb-api.onrender.com/auth/vote`,
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

	return (
		<div className="rating-post-container">
			<div className="post-card">
				<div className="post-header">
					<div className="post-votes">
						<img
							id="upvote-arrow"
							src={`//assets/${
								votedPosts[id] === "up"
									? "up-arrow.png"
									: "grayed-up-arrow.png"
							}`}
							alt="upvote"
							onClick={() => handleVote(id, "rating", "up")}
							style={{
								transform: "rotate(100)",
								cursor: "pointer",
							}}
						/>
						<img
							id="downvote-arrow"
							src={`//assets/${
								votedPosts[id] === "down"
									? "down-arrow.png"
									: "grayed-down-arrow.png"
							}`}
							alt="downvote"
							onClick={() => handleVote(id, "rating", "down")}
							style={{ cursor: "pointer" }}
						/>
					</div>
					<div className="post-title">
						<h1>{rating.name}</h1>
					</div>
					<div className="post-right">
						<ExternalLink
							onClick={copyToClipboard}
							className="share-icon"
							size={40}
							style={{ cursor: "pointer", color: "pink" }}
						/>
						<img
							src={
								isSaved
									? "//assets/heart.png"
									: "//assets/grayed-heart.png"
							}
							alt="like-icon"
							className="post-heart"
							onClick={handleSaveClick}
						/>
					</div>
				</div>
				<div className="post-content">
					<div className="content-left">
						{rating.imageUrl ? (
							<img
								src={`http://https://csulb-api.onrender.com${rating.imageUrl}`}
								alt={rating.name}
							/>
						) : (
							<img
								src={`//assets/no-image-placeholder.png`}
								alt={rating.name}
								style={{ width: "80%", objectFit: "contain" }}
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
										src="//assets/star.png"
										alt="star"
										className="rating-star"
									/>
								)
							)}
						</div>
						<div className="content-description">
							<h2>My Review:</h2>
							<p>{rating.reviewText}</p>
						</div>
					</div>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export default RatingPost;
