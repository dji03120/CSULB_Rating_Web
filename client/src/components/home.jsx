// client/src/components/Home.jsx
import React from "react";
import "./home.css";
import Navbar from "./navbar";

export const Home = () => {
	return (
		<div className="home-container">
			<div className="home-content">
				<h1 className="home-title">Welcome to CSULB Rates</h1>
				<p className="home-description">
					This is the general homepage.
				</p>
				{/* WILL ADD MORE CONTENT HERE WHEN NECESSARY */}
			</div>
		</div>
	);
};
