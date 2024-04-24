import React from 'react';
import './Home.css';

const HomePage = () => {
    return (
        <body>
            <div className="home-container">
                <h1>Welcome to Flight Roster Application</h1>
                <p>This application helps you manage flight rosters easily.</p>
                <div className="buttons">
                    <a href="/login" className="login-button">Log In</a>
                    <a href="/signup" className="signup-button">Sign Up</a>
                </div>
            </div>
        </body>
    );
};

export default HomePage;
