import React, { useState } from 'react';
import axios from 'axios';
import './CreatePoll.css'; // Custom CSS for CreatePoll

const CreatePoll = () => {
    const [pollQuestion, setPollQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!pollQuestion.trim() || options.some(option => !option.trim())) {
            setError("Please provide a question and at least two valid options.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/polls', {
                question: pollQuestion,
                options,
            });

            if (response.status === 200) {
                setSuccess(true);
                setPollQuestion('');
                setOptions(['', '']);
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
                                placeholder={`Option ${index + 1}`}
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="remove-option-button"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="add-option-button">
                        Add Option
                    </button>
                </div>

                {/* Messages */}
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Poll created successfully!</p>}

                {/* Submit Button */}
                <button type="submit" className="submit-poll-button">
                    Submit Poll
                </button>
            </form>
        </div>
    );
};

export default CreatePoll;
