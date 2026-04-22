import { useState } from "react";
import axios from "axios";
import { Form } from "../components/Form";
import "./Register.css";
import { useNavigate } from "react-router-dom";

export const Register = () => {
	const [studentId, setStudentId] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const [passwordChecks, setPasswordChecks] = useState({
	length: false,
	letter: false,
	number: false,
	special: false,
});

	// Function to validate email format
	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Function to validate student ID
	// Checks if studentID is a 9-digit number
	const validateStudentID = (studentID) => {
		return studentID.length == 9 && /^\d+$/.test(studentID);
	};

	// Validates Pssword strength
	const validatePassword = (password) => {
	return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
	};

	const handlePasswordChange = (value) => {
	setPassword(value);

	setPasswordChecks({
		length: value.length >= 8,
		letter: /[A-Za-z]/.test(value),
		number: /\d/.test(value),
		special: /[@$!%*?&]/.test(value),
		});
	};

	// Handles form submission for registration
	const onSubmit = async (event) => {
		event.preventDefault();

		// Check for empty fields
		if (!studentId || !email || !password) {
			alert("Please fill out all fields."); // Popup alert for empty fields
			return;
		}

		// Check for valid email format
		if (!validateEmail(email)) {
			alert("Please enter a valid email address."); // Popup alert for invalid email
			return;
		}

		// Check for valid studentID
		if  (!validateStudentID(studentId)) {
			alert("Please enter a valid student ID.") // Popup alert for invalid student ID
			return;
		}

		if (!validatePassword(password)) {
			alert("Password must be at least 8 characters and include letters, numbers, and special characters.");
			return;
		}

		try {
			await axios.post("https://csulb-api.onrender.com/auth/register", {
				studentId,
				email,
				password,
			});
			alert("Registration complete"); // Success popup
			navigate("/login");
			} catch (error) {
		console.error(error);

		if (error.response) {
			const message = error.response.data.message;
			alert(message);
		} else {
			alert("A network or server error occurred. Please try again later.");
				}
			}	
	};

	const goToLogin = () => {
		navigate("/login");
	};

	return (
		<div className="register-container">
			<img
				src="/assets/drink.png"
				alt="register-drink"
				// style={{ filter: "drop-shadow(0 0 3px rgba(0, 0, 0, 0))" }}
			/>
			<div className="register">
				<div className="register-header">
					<img
						src="/assets/star.png"
						alt="Logo"
						className="logo"
						style={{ width: "60px", height: "60px" }}
					/>
					<div className="register-prompt">
						<span className="register-title">
							Create your account!
						</span>
						<p className="register-description">
							Please enter your details
						</p>
					</div>
				</div>
				<div className="register-content">
					<Form
						studentId={studentId}
						setStudentId={setStudentId}
						email={email}
						setEmail={setEmail}
						password={password}
						setPassword={handlePasswordChange}
						passwordChecks={passwordChecks}
						label="Register"
						onSubmit={onSubmit}
					/>

					
					<span className="register-bottom-prompt">
						Already a Member?{" "}
						<span
							className="register-bottom-link"
							onClick={goToLogin}
						>
							Sign in
						</span>
					</span>
				</div>
			</div>
		</div>
	);
};
