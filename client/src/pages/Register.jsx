import { useState } from 'react';
import axios from 'axios';
import { Form } from '../components/Form';

export const Register = () => {
    const [studentId, setStudentId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Function to validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

        try {
            await axios.post("http://localhost:5000/auth/register", {
                studentId,
                email,
                password,
            });
            alert("Registration complete"); // Success popup
        } catch (error) {
            console.error(error);

            if (error.response) {
                const { status } = error.response;

                // Handle 400 and 500 status codes with the same message
                if (status === 400 || status === 500) {
                    alert("This Student ID or email already exists.");
                } else {
                    alert("An error occurred while registering. Please try again.");
                }
            } else {
                alert("A network or server error occurred. Please try again later.");
            }
        }
    };

    return (
        <Form 
            studentId={studentId}
            setStudentId={setStudentId}
            email={email}
            setEmail={setEmail} 
            password={password} 
            setPassword={setPassword}
            label="Register"
            onSubmit={onSubmit}
        />
    );
};
