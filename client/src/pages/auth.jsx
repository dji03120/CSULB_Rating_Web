import { useState } from 'react';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
    return (
    <div className="auth">
        <Login />
        <Register />
    </div>
    );
}

const Login = () => { 
    const [studentId, setStudentId] = useState("")
    const [password, setPassword] = useState("")
    const [_, setCookies] = useCookies(["access_token"])
    const navigate = useNavigate()

    const onSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post("http://https://csulb-api.onrender.com/auth/login", {
                studentId,
                password,
            });

            setCookies("access_token", response.data.token)
            window.localStorage.setItem("userId", response.data.user._id)
            navigate("/")
        } catch (error) {
            console.error(error);
            alert("Login failed");
        }
    };

    return (
        <Form 
            studentId={studentId} 
            setStudentId={setStudentId} 
            password={password} 
            setPassword={setPassword}
            label="Login"
            onSubmit={onSubmit}
        />
    );
};

const Register = () => {
    const [studentId, setStudentId] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    
    const onSubmit = async (event) => {
        event.preventDefault();

        try {
            await axios.post("http://https://csulb-api.onrender.com/auth/register", {
                studentId,
                email,
                password,
            });
            alert("Registration complete")
        } catch (error) {
            console.error(error);
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

// Creates form for register and login
const Form = ({ studentId, setStudentId, email, setEmail, password, setPassword, label, onSubmit }) => {
    return (
        <form onSubmit={onSubmit}>
            <h2>{label}</h2>
            <div className="form-group">
                <label htmlFor="studentId">Student ID: </label>
                <input
                    type="text" 
                    id="studentId" 
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}/>
            </div>
            {label === "Register" && (
                <div className="form-group">
                    <label htmlFor="email">Email: </label>
                    <input 
                        type="text" 
                        id="email" 
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}/>
                </div>
            )}
            <div className="form-group">
                <label htmlFor="password">Password: </label>
                <input 
                    type="password" 
                    id="password" 
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}/>
            </div>
            {/* Submits the form when button is clicked */}
            <button type="submit">{label}</button>
        </form>
    );
};