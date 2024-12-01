import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ isAuthenticated, handleLogout }) => {
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef(null);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const userDropdownRef = useRef(null);
	const navigate = useNavigate();
	const location = useLocation();

	const gotoHomepage = () => navigate("/"); // Navigates to homepage
	const goToLogin = () => navigate("/login"); // Navigates to login page
	const goToRegister = () => navigate("/register"); // Navigates to register page

	const handleClickOutside = (event) => {
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(event.target)
		) {
			setShowDropdown(false);
		}
		if (
			userDropdownRef.current &&
			!userDropdownRef.current.contains(event.target)
		) {
			setShowUserDropdown(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="navbar">
			<div className="navbar-content">
				<h1 className="navbar-title" onClick={gotoHomepage}>
					<img
						src="/src/assets/star.png"
						alt="Logo"
						className="logo"
					/>
					CSULB Rates
				</h1>
				<div className="navbar-buttons">
					{isAuthenticated ? (
						<>
							<div className="dropdown" ref={dropdownRef}>
								<button
									className={`navbar-button ${
										location.pathname === "/create-rating"
											? "active"
											: ""
									}`}
									onClick={() =>
										setShowDropdown(!showDropdown)
									}
								>
									Create
								</button>
								{showDropdown && (
									<div className="dropdown-menu">
										<button
											className="dropdown-item"
											onClick={() => {
												navigate("/create-rating");
												setShowDropdown(false);
											}}
										>
											Rating
										</button>
										<button
											className="dropdown-item"
											onClick={() => {
												navigate("/create-poll");
												setShowDropdown(false);
											}}
										>
											Poll
										</button>
									</div>
								)}
							</div>
							<button
								className="navbar-button"
								onClick={() => {
									navigate("/bookmarks");
								}}
							>
								Bookmarks
							</button>
							<div className="dropdown" ref={userDropdownRef}>
								<button
									className="navbar-button"
									onClick={() =>
										setShowUserDropdown(!showUserDropdown)
									}
								>
									User
								</button>
								{showUserDropdown && (
									<div className="dropdown-menu dropdown-menu-right">
										<button
											className="dropdown-item"
											onClick={() => {
												navigate("/my-posts");
												setShowUserDropdown(false);
											}}
										>
											My Posts
										</button>
										<button
											className="dropdown-item"
											onClick={() => {
												handleLogout();
												setShowUserDropdown(false);
											}}
										>
											Log Out
										</button>
									</div>
								)}
							</div>
						</>
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
