// client/src/components/Home.jsx
import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom"

export const Home = () => {
	const navigate = useNavigate();
	const [ratings, setRatings] = useState([])

	useEffect(() => {
		const fetchRating = async () => {
			try {
				const response = await axios.get("http://localhost:5000/ratings");
				setRatings(response.data);
			} catch (err) {
				console.error(err)
			}
		}

		fetchRating()
	}, []);

	const gotoCreateRating = () => navigate("/create-rating")  // Navigates to page to create a rating
	const gotoCreatePoll = () => navigate("/create-poll")  // Navigates to page to create a poll

	return (
		<div>
			<div className="home-container">
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
							</div>
							<div>
								<p>{rating.rating}</p>
							</div>
							<img src={`http://localhost:5000${rating.imageUrl}`} alt={rating.name} />
							<p>{rating.reviewText}</p>
						</li>		
					))}
				</ul>
			</div>
		</div>
			
		</div>
	)
		
};
