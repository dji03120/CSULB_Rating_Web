import React, { useState } from 'react';
import axios from 'axios';
import rightArrow from '../assets/right-arrow.png';  // Path to right arrow image
import './CreatePoll.css'; // Custom CSS for CreatePoll

const CreatePoll = () => {
    const [pollQuestion, setPollQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [endDate, setEndDate] = useState(''); // add status of end date

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!pollQuestion.trim() || options.some(option => !option.trim())) {
            setError("-Please provide a question and at least two valid options-");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/polls', {
                question: pollQuestion,
                options,
                endDate,
            });

            if (response.status === 200) {
                setSuccess(true);
                setPollQuestion('');
                setOptions(['', '']);
                setEndDate('');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while submitting your poll.');
        }
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    return (
        <div className="create-poll-wrapper">
            <h1 className="page-title">Create a New Poll</h1>
            <form onSubmit={handleSubmit} className="create-poll-form">
                {/* Poll Question과 End Date를 한 줄에 배치 */}
                <div className="form-header">
                    {/* Poll Question */}
                    <div className="poll-question">
                        <label htmlFor="pollQuestion">Poll Question:</label>
                        <input
                            id="pollQuestion"
                            type="text"
                            value={pollQuestion}
                            onChange={(e) => setPollQuestion(e.target.value)}
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
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                                placeholder={`Poll Option ${index + 1}`}
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="remove-option-button"
                                >
                                    -
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="add-option-button">
                        +
                    </button>
                </div>

                {/* Messages */}
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Poll created successfully!</p>}

                {/* Submit Button (Arrow)*/}
                <img
                    src={rightArrow}
                    alt="Submit"
                    className="submit-button"
                    onClick={handleSubmit}
                />
            </form>
        </div>
    );
};

export default CreatePoll;
