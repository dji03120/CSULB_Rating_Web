import React, { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";

export const Home = () => {
	const navigate = useNavigate();
	const [ratings, setRatings] = useState([]); // State for ratings data
	const [polls, setPolls] = useState([]); // State for poll data

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch ratings data
				const ratingResponse = await axios.get(
					"http://localhost:5000/ratings"
				);
				setRatings(ratingResponse.data);

				// Fetch poll data
				const pollResponse = await axios.get(
					"http://localhost:5000/polls"
				);
				setPolls(pollResponse.data); // Store poll data in state
			} catch (err) {
				console.error(err);
			}
		};

		fetchData();
	}, []);

	// Handler for voting on a poll option
	const handleVoteClick = async (pollId, optionIndex) => {
		try {
			const response = await axios.put("http://localhost:5000/polls/vote", {
				pollID: pollId,
				optionIndex: optionIndex,
			});

			if (response.status === 200) {
				alert("Vote submitted successfully!");

				// Update the poll data with the new vote count
				setPolls((prevPolls) =>
					prevPolls.map((poll) =>
						poll._id === pollId ? response.data.updatedPoll : poll
					)
				);
			}
		} catch (err) {
			console.error("Failed to submit vote:", err);
			alert("Failed to submit vote. Please try again.");
		}
	};

	// Navigate to the "Create Rating" page
	const gotoCreateRating = () => navigate("/create-rating");

	return (
		<div className="home-container">
			<div className="search-bar-container">
				<input type="text" placeholder="Search" />
			</div>
			<div className="home-content">
				<span className="home-header">New Ratings & Polls</span>

				{/* Ratings Section */}
				{ratings.map((rating) => (
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
									src="src/assets/heart.png"
									alt="like-icon"
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

				{/* Polls Section */}
				{polls.map((poll) => (
					<div key={poll._id} className="poll-card">
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
			</div>
		</div>
	);
};