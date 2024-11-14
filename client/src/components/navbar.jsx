import React from "react";
import { useNavigate } from "react-router-dom"
import "./navbar.css";

const Navbar = () => {
	const navigate = useNavigate();

	const gotoHomepage = () => navigate("/")  // Navigates to homepage
	const goToLogin = () => navigate("/login")  // Navigates to login page
	const goToRegister = () => navigate("/register")  // Navigates to register page
	
	return (
		<nav className="navbar">
			<div className="navbar-content">
				<h1 className="navbar-title" onClick={gotoHomepage}>
					<img
						src="src/assets/star.png"
						alt="Logo"
						className="logo"
					/>
					CSULB Rates
				</h1>
				<div className="navbar-buttons">
					<button className="navbar-button" onClick={goToLogin}>Login</button>
					<button className="navbar-button" onClick={goToRegister}>Register</button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
