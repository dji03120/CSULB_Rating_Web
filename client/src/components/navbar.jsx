import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ isAuthenticated, handleLogout }) => {
	const navigate = useNavigate();
	const location = useLocation();

	const gotoHomepage = () => navigate("/"); // Navigates to homepage
	const goToLogin = () => navigate("/login"); // Navigates to login page
	const goToRegister = () => navigate("/register"); // Navigates to register page

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
					{isAuthenticated ? (
						<button
							className="navbar-button"
							onClick={handleLogout}
						>
							Log Out
						</button> // Log Out button
					) : (
						<>
							<button
								className={`navbar-button ${
									location.pathname === "/login"
										? "active"
										: ""
								}`}
								onClick={goToLogin}
							>
								Login
							</button>
							<button
								className={`navbar-button ${
									location.pathname === "/register"
										? "active"
										: ""
								}`}
								onClick={goToRegister}
							>
								Register
							</button>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
