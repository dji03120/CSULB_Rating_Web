// Update CreatePoll.jsx
import React, { useState } from "react";
import axios from "axios";
import rightArrow from "../assets/right-arrow.png"; // Path to right arrow image
import "./CreatePoll.css"; // Custom CSS for CreatePoll
import { useNavigate } from "react-router-dom";

const CreatePoll = () => {
	const [pollQuestion, setPollQuestion] = useState(""); // State for poll question
	const [options, setOptions] = useState(["", ""]); // State for poll options
	const [endDate, setEndDate] = useState(""); // State for poll end date
	const [error, setError] = useState(null); // State for error message
	const [success, setSuccess] = useState(false); // State for success message
	const [isLoading, setIsLoading] = useState(false); // State for loading status
	const navigate = useNavigate(); // Hook for page navigation

	// Handler for submitting the poll creation request
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null); // Reset error message
		setSuccess(false); // Reset success message

		// Validation
		if (!pollQuestion.trim()) {
			setError("Please provide a valid question."); // Return error if the question is empty
			return;
		}

		if (options.some((option) => !option.trim())) {
			setError("Options cannot be empty."); // Return error if any option is empty
			return;
		}

		if (new Set(options).size !== options.length) {
			setError("Options cannot be duplicate."); // Return error if options are duplicate
			return;
		}

		if (!endDate) {
			setError("Please select a valid end date."); // Return error if end date is not selected
			return;
		}

		// Date comparison: Remove time information and compare only the date
		const selectedDate = new Date(endDate);
		const today = new Date();
		selectedDate.setHours(0, 0, 0, 0); // Reset time for the selected date
		today.setHours(0, 0, 0, 0); // Reset time for today's date

		if (selectedDate < today) {
			setError("End date cannot be in the past."); // Return error if the end date is in the past
			return;
		}

		try {
			setIsLoading(true); // Activate loading state
			const response = await axios.post("http://localhost:5000/polls", {
				question: pollQuestion,
				options,
				endDate: selectedDate.toISOString(), // Convert date to UTC
			});

			if (response.status === 200) {
				setSuccess(true); // Show success message
				setPollQuestion(""); // Reset question
				setOptions(["", ""]); // Reset options
				setEndDate(""); // Reset end date

				// Redirect to the home page after 2 seconds
				setTimeout(() => navigate("/"), 2000);
			}
		} catch (err) {
			console.error(err); // Log error
			setError("An error occurred while submitting your poll."); // Display error message
		} finally {
			setIsLoading(false); // Deactivate loading state
		}
	};

	// Handler for adding a new option
	const addOption = () => {
		if (options.length >= 10) {
			setError("You cannot add more than 10 options."); // Limit the number of options
			return;
		}
		setOptions([...options, ""]); // Add a new empty option
	};

	// Handler for removing an option
	const removeOption = (index) => {
		setOptions(options.filter((_, i) => i !== index)); // Remove the specified option
	};

	// Handler for updating option values
	const handleOptionChange = (index, value) => {
		const newOptions = [...options];
		newOptions[index] = value; // Update the value of the specified option
		setOptions(newOptions);
	};

	return (
		<div className="create-poll-wrapper">
			<h1 className="page-title">Create a New Poll</h1>
			<div className="create-poll-container">
				<form onSubmit={handleSubmit} className="create-poll-form">
					{/* Place Poll Question and End Date on the same row */}
					<div className="form-header">
						{/* Poll Question */}
						<div className="poll-question">
							<label htmlFor="pollQuestion">Poll Question:</label>
							<input
								id="pollQuestion"
								type="text"
								value={pollQuestion}
								onChange={(e) =>
									setPollQuestion(e.target.value)
								}
								required
								placeholder="Enter your poll question"
							/>
						</div>

						{/* End Date */}
						<div className="poll-end-date">
							<label htmlFor="endDate">End Date:</label>
							<input
								id="endDate"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								required
							/>
						</div>
					</div>
					{/* Poll Options */}
					<div className="poll-options">
						<label>Options:</label>
						{options.map((option, index) => (
							<div key={index} className="option-input">
								<input
									type="text"
									value={option}
									onChange={(e) =>
										handleOptionChange(
											index,
											e.target.value
										)
									}
									required
									placeholder={`Poll Option ${index + 1}`}
								/>
								{options.length > 2 && (
									<button
										type="button"
										onClick={() => removeOption(index)}
										className="remove-option-button"
									>
										×
									</button>
								)}
							</div>
						))}
						<button
							type="button"
							onClick={addOption}
							className="add-option-button"
						>
							+
						</button>
					</div>
					{/* Messages */}
					{error && <p className="error-message">{error}</p>}{" "}
					{/* Error message */}
					{success && (
						<p className="success-message">
							Poll created successfully! Redirecting...
						</p>
					)}{" "}
					{/* Success message */}
					{isLoading && (
						<p className="loading-message">
							Submitting your poll...
						</p>
					)}{" "}
					{/* Loading message */}
					{/* Submit Button (Arrow) */}
					<img
						src={rightArrow}
						alt="Submit"
						className={`submit-poll-button ${
							isLoading ? "disabled" : ""
						}`}
						onClick={!isLoading ? handleSubmit : null} // Disable when loading
					/>
				</form>
			</div>
		</div>
	);
};

export default CreatePoll;
