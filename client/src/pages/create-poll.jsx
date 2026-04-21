// Update CreatePoll.jsx
import React, { useState } from "react";
import { API } from "../api/api";
import "./CreatePoll.css"; // Custom CSS for CreatePoll
import { useNavigate } from "react-router-dom";

const CreatePoll = () => {
	const [pollQuestion, setPollQuestion] = useState(""); // State for poll question
	const [options, setOptions] = useState(["", ""]); // State for poll options
	const [endDate, setEndDate] = useState(""); // State for poll end date
	const [isLoading, setIsLoading] = useState(false); // State for loading status
	const [popupMessage, setPopupMessage] = useState(null); // For popup message of submission status
	const [popupType, setPopupType] = useState(""); // 'success' or 'error'
	const navigate = useNavigate(); // Hook for page navigation

	// Handler for submitting the poll creation request
	const handleSubmit = async (e) => {
		e.preventDefault();
		setPopupMessage(null);
	
		// Validation
		if (!pollQuestion.trim()) {
			setPopupMessage("Please provide a valid question."); // Return error if the question is empty
			setPopupType("error");
			setTimeout(() => setPopupMessage(null), 3000);
			return;
		}
	
		if (options.some((option) => !option.trim())) {
			setPopupMessage("Options cannot be empty."); // Return error if any option is empty
			setPopupType("error");
			setTimeout(() => setPopupMessage(null), 3000);
			return;
		}
	
		if (new Set(options).size !== options.length) {
			setPopupMessage("Options cannot be duplicate."); // Return error if options are duplicate
			setPopupType("error");
			setTimeout(() => setPopupMessage(null), 3000);
			return;
		}
	
		if (!endDate) {
			setPopupMessage("Please select a valid end date."); // Return error if end date is not selected
			setPopupType("error");
			setTimeout(() => setPopupMessage(null), 3000);
			return;
		}
	
		// Date comparison: Remove time information and compare only the date
		const selectedDate = new Date(endDate);
		const today = new Date();
		selectedDate.setHours(0, 0, 0, 0); // Reset time for the selected date
		today.setHours(0, 0, 0, 0); // Reset time for today's date
	
		if (selectedDate < today) {
			setPopupMessage("End date cannot be in the past."); // Return error if the end date is in the past
			setPopupType("error");
			setTimeout(() => setPopupMessage(null), 3000);
			return;
		}
	
		const userID = localStorage.getItem("userId");
	
		try {
			setIsLoading(true); // Activate loading state
			const selectedDate = new Date(endDate);
			selectedDate.setHours(23, 59, 59, 999);
			const response = await API.post("/polls", {
				question: pollQuestion,
				options,
				createdBy: userID,
				endDate: selectedDate.toISOString(), // Convert date to UTC
			});
	
			if (response.status === 200) {
				setPopupMessage("Poll submitted successfully! Redirecting...");
				setPopupType("success");
				setPollQuestion(""); // Reset question
				setOptions(["", ""]); // Reset options
				setEndDate(""); // Reset end date
				// Redirect to the home page after 2 seconds
				setTimeout(() => navigate("/"), 2000);
			}
		} catch (err) {
			console.error(err); // Log error
			setPopupMessage("An error occurred while submitting your poll."); // Display error message
			setPopupType("error");
		} finally {
			setIsLoading(false); // Deactivate loading state
		}

		// Popup disappears after 3 seconds
		setTimeout(() => setPopupMessage(null), 3000);
	};

	// Handler for adding a new option
	const addOption = () => {
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
			{/* Popup Message of success status*/}
			{popupMessage && (
				<div className={`popup-message ${popupType}`}>
					{popupMessage}
				</div>
			)}
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
					{/* Submit Button (Arrow) */}
					<img
					src="/assets/right-arrow.png"
					alt="Submit"
					className={`submit-poll-button ${isLoading ? "disabled" : ""}`}
					onClick={!isLoading ? handleSubmit : null}
					/>
				</form>
			</div>
		</div>
	);
};

export default CreatePoll;
