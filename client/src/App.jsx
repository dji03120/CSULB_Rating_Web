import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './components/home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Navbar from './components/navbar'; // Import Navbar
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for token in localStorage on initial render
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("userId");
        setIsAuthenticated(false); // Update authentication state
        window.location.href = "/"; // Redirect to home page and refresh
    };

    return (
        <Router>
            <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} /> {/* Pass props to Navbar */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={<Login setIsAuthenticated={setIsAuthenticated} />} // Pass setIsAuthenticated to Login
                />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
