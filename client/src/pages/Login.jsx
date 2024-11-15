import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { Form } from '../components/Form';

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
            const response = await axios.post("http://localhost:5000/auth/login", {
                studentId,
                password,
            });

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
        <div>
            <Form 
                studentId={studentId} 
                setStudentId={setStudentId} 
                password={password} 
                setPassword={setPassword}
                label="Login"
                onSubmit={onSubmit}
            />
            <p>
                Not a Member?{" "}
                <span 
                    onClick={goToRegister} 
                    style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                >
                    Sign up
                </span>
            </p>
        </div>
    );
};
