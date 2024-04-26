import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const HomePage = () => {
    return (
        <div className="home-layout">
            <div className="home-logo">
                <img src="./logo.png" alt="logo" className='home-logo-img' />
            </div>
            <div className="home-container">
                <h2>WELCOME TO FLIGHT ROSTER APPLICATION</h2>
                <p>This application helps you manage flight rosters easily.</p>
                <div className="home-buttons">
                    <Link to="/login" className="home-button">Log In</Link>
                    <Link to="/signup" className="home-button">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
