import React, { useState } from "react";
import axios from "axios";
import filledStar from "../assets/star.png"; // Path to star image
import emptyStar from "../assets/grayed-star.png"; // Path to empty star image
import rightArrow from "../assets/right-arrow.png"; // Path to right arrow image
import "./CreateRating.css";

// Component to create a rating
const CreateRating = () => {
	const [name, setName] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [image, setImage] = useState("");
	const [rating, setRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [popupMessage, setPopupMessage] = useState(null); // For popup message of submission status
	const [popupType, setPopupType] = useState(""); // 'success' or 'error'
	const [touched, setTouched] = useState({
		name: false,
		rating: false,
		reviewText: false,
	});

	// Handles submission of the rating
	const handleSubmit = async (e) => {
		e.preventDefault();
		setPopupMessage(null);

		setTouched({
			name: true,
			rating: true,
			reviewText: true,
		});

		if (!name || !rating || !reviewText) {
			setPopupMessage("Please fill out all required fields.");
			setPopupType("error");
			setTimeout(() => setPopupMessage(null), 3000);
			return;
		}

		const formData = new FormData();
		formData.append("name", name);
		formData.append("rating", rating);
		formData.append("reviewText", reviewText);
		if (image) {
			formData.append("image", image);
		} else {
			formData.append("imageUrl", imageUrl);
		}

		try {
			const response = await axios.post(
				"http://localhost:5000/ratings",
				formData,
				{
					headers: { "Content-Type": "multipart/form-data" },
				}
			);

			if (response.status === 200) {
				setPopupMessage("Rating submitted successfully!");
				setPopupType("success");
				setName("");
				setRating(0);
				setReviewText("");
				setImage(null);
				setImageUrl("");
			}
			setTouched({ name: false, rating: false, reviewText: false });
		} catch (err) {
			// setPopupMessage("Please fill out all required fields.");
			// setPopupType("error");
			setPopupMessage("An error occurred while submitting.");
			setPopupType("error");
		}

		// Popup disappears after 3 seconds
		setTimeout(() => setPopupMessage(null), 3000);
	};

	// Sets the rating when clicking on the stars
	const handleStarClick = (starValue) => {
		setRating(starValue);
	};

	// Handles uploading an image file
	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		setImage(file);
		if (file) {
			setImageUrl(URL.createObjectURL(file)); // Create a temporary URL for image preview
		}
	};

	const handleBlur = (field) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	return (
		<div className="create-rating-wrapper">
			{/* Popup Message of success status*/}
			{popupMessage && (
				<div className={`popup-message ${popupType}`}>
					{popupMessage}
				</div>
			)}

			{/* Title */}
			<h1 className="page-title">Create a New Rating</h1>
			<div className="create-rating-container">
				{/* Left side of form */}
				<div className="create-rating-left">
					<div>
						{/* Title of rating */}
						<label>Title: </label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							onBlur={() => handleBlur("name")}
							className={`${
								touched.name && !name ? "invalid" : ""
							}`}
							required
							placeholder="Name of cafe, concert, events, food, etc."
						/>
					</div>
					{/* Section to upload an image */}
					<div>
						<label>Upload Image: </label>
						<input type="file" onChange={handleImageUpload} />
						{/* {imageUrl && (
							<img
								src={imageUrl}
								alt="Image Preview"
								className="image-preview"
							/>
						)} */}
					</div>
					<div className="image-area">
						{imageUrl ? (
							<img src={imageUrl} alt="uploaded image" />
						) : (
							<img
								src="src/assets/emptyimage.png"
								alt="emptyimage"
								style={{ width: "200px", height: "200px" }}
							/>
						)}
					</div>
				</div>
				{/* Right side of form */}
				<div className="create-rating-right">
					{/* Submit button */}
					<img
						src={rightArrow}
						className="submit-rating-button"
						onClick={handleSubmit}
					/>
					{/* Stars for rating */}
					<div className="rating-stars-container">
						{/* <label></label> */}
						<div
							className={`rating-stars ${
								touched.rating && !rating
									? "invalid-container"
									: ""
							}`}
						>
							{/* Correlates number of stars pressed to the rating number */}
							{[1, 2, 3, 4, 5].map((star) => (
								<img
									key={star}
									src={
										star <= rating ? filledStar : emptyStar
									}
									alt={`${star} star`}
									onClick={() => handleStarClick(star)}
									style={{ cursor: "pointer" }}
									className="star"
								/>
							))}
						</div>
					</div>
					{/* Review Section */}
					<div>
						<label>Review: </label>
						<textarea
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
							onBlur={() => handleBlur("reviewText")}
							className={`${
								touched.reviewText && !reviewText
									? "invalid"
									: ""
							}`}
							required
							placeholder="Write your review here..."
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateRating;
