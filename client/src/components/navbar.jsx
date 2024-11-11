import React from "react";
import "./navbar.css";

const Navbar = () => {
	return (
		<nav className="navbar">
			<div className="navbar-content">
				<h1 className="navbar-title">
					<img
						src="src/assets/star.png"
						alt="Logo"
						className="logo"
					/>
					CSULB Rates
				</h1>
				<div className="navbar-buttons">
					<button className="navbar-button">Login</button>
					<button className="navbar-button">Register</button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
