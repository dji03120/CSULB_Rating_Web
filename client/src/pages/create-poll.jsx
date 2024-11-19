// create poll
import React, { useState } from 'react';
import axios from 'axios';
import './CreatePoll.css';

const CreatePoll = () => {
    const [pollQuestion, setPollQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Ensure the poll question and options are valid
        if (!pollQuestion || options.some(option => !option)) {
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
                setOptions(['', '']); // Reset options
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while submitting your poll.');
        }
    };

    // Handles adding a new option
    const addOption = () => {
        setOptions([...options, '']);
    };

    // Handles removing an option
    const removeOption = (index) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    // Handles changing an option
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    return (
        <div className="create-poll-container">
            <h2>Create Poll</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Poll Question:</label>
                    <input
                        type="text"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Options:</label>
                    {options.map((option, index) => (
                        <div key={index} className="option-input">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                required
                            />
                            {options.length > 2 && (
                                <button type="button" onClick={() => removeOption(index)}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addOption}>
                        Add Option
                    </button>
                </div>
                <button type="submit">Submit Poll</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>Poll created successfully!</p>}
        </div>
    );
};

export default CreatePoll;
