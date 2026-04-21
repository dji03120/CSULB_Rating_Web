import { useState, useEffect } from "react";
import { API } from "../api/api";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Form } from "../components/Form";
import "./Login.css";

export const Login = ({ setIsAuthenticated }) => {
	const [studentId, setStudentId] = useState("");
	const [password, setPassword] = useState("");
	const [cookies, setCookies] = useCookies(["access_token"]);
	const navigate = useNavigate();

	// Check for token in localStorage on initial render
	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (token) {
			setIsAuthenticated(true);
		}
	}, [setIsAuthenticated]);

	// Handles form submission for login
	const onSubmit = async (event) => {
		event.preventDefault();

		try {
			const response = await API.post("/auth/login",
				{
					studentId,
					password,
				}
			);

			setCookies("access_token", response.data.token);
			window.localStorage.setItem("access_token", response.data.token); // Store token in localStorage
			window.localStorage.setItem("userId", response.data.user._id);
			setIsAuthenticated(true); // Update authentication state
			navigate("/"); // Redirect to home
		} catch (error) {
			console.error(error);
			alert("Login failed");
		}
	};

	// Navigates to the register page
	const goToRegister = () => {
		navigate("/register");
	};

	return (
		<div className="login-container">
			<img
				src="/assets/icecream.png"
				alt="login-icecream"
				// style={{ filter: "drop-shadow(0 0 3px rgba(0, 0, 0, 0))" }}
			/>
			<div className="login">
				<div className="login-header">
					<img
						src="/assets/star.png"
						alt="Logo"
						className="logo"
						style={{ width: "60px", height: "60px" }}
					/>
					<div className="login-prompt">
						<span className="login-title">Welcome Back!</span>
						<p className="login-description">
							Please enter your details
						</p>
					</div>
				</div>
				<div className="login-content">
					<Form
						studentId={studentId}
						setStudentId={setStudentId}
						password={password}
						setPassword={setPassword}
						label="Login"
						onSubmit={onSubmit}
					/>
					<span className="login-bottom-prompt">
						Not a Member?{" "}
						<span
							className="login-bottom-link"
							onClick={goToRegister}
							style={{
								cursor: "pointer",
								fontWeight: "bold",
								hover: "underline",
							}}
						>
							Sign up
						</span>
					</span>
				</div>
			</div>
		</div>
	);
};
