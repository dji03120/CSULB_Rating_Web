// client/src/components/header.jsx
import React from 'react';
import './header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                <h1 className="header-title">CSULB Rates</h1>
                <div className="header-buttons">
                    <button className="header-button">Login</button>
                    <button className="header-button">Register</button>
                </div>
            </div>
        </header>
    );
};

export default Header;