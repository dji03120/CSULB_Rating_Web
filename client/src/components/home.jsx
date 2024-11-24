// client/src/components/Home.jsx
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";

export const Home = () => {
	const navigate = useNavigate();
	const [ratings, setRatings] = useState([])
	const [polls, setPolls] = useState([])
	const [ratings, setRatings] = useState([]);

	useEffect(() => {
		const fetchRating = async () => {
			try {
				const response = await axios.get(
					"http://localhost:5000/ratings"
				);
				setRatings(response.data);
			} catch (err) {
				console.error(err);
			}
		};

		fetchRating();
	}, []);

	const gotoCreateRating = () => navigate("/create-rating")  // Navigates to page to create a rating
	const gotoCreatePoll = () => navigate("/create-poll")  // Navigates to page to create a poll

	const gotoCreateRating = () => navigate("/create-rating"); // Navigates to page to create a rating
	return (
		<div className="home-container">
			<div className="search-bar-container">
				<input type="text" placeholder="Search" />
			</div>
			<div className="home-content">
				<h1 className="home-title">Welcome to CSULB Rates</h1>
				{/* Create a Rating and Create a Poll buttons */}
				<button onClick={gotoCreateRating}>Create a Rating</button>  
				<button onClick={gotoCreatePoll}>Create a Poll</button>
				<p className="home-description">New Ratings & Polls</p>
				
				<ul>
					{ratings.map((rating) => (
						<li key={rating._id}>
							<div>
								<h2>{rating.name}</h2>
				{/* <h1 className="home-title">Welcome to CSULB Rates</h1>
				<button onClick={gotoCreateRating}>Create a Rating</button> */}
				<span className="home-header">New Ratings & Polls</span>
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
			</div>
		</div>
	</div>
	)
		
	);
};
