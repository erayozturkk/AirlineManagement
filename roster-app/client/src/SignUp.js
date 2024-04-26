import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css';

const SignUpPage = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '', // Assuming you'll add an email field
        password: '',
        confirmPassword: ''
    });

    const { username, email, password, confirmPassword } = userData;

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            // Handle password mismatch
            console.error("Passwords don't match!");
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const body = JSON.stringify({ username, email, password }); // Assuming you want to include the email
            const response = await axios.post('http://localhost:5001/api/auth/register', body, config);
            console.log(response.data); // Handle success response
            // Redirect user or show success message
        } catch (err) {
            console.error(err.response.data); // Handle errors
        }
    };

    return (
        <body>
            <div className="login-logo">
                <img src="./logo.png" alt="logo" className='login-logo' />
            </div>
            <div className="login-container">
                <h2>FLIGHT ROSTER APPLICATION</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={handleChange}
                            />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={handleChange}
                            />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={handleChange}
                            />
                    </div>
                    <button type="submit">Sign Up</button>
                </form>
                <a href="/login">Already have an account? Log in here</a>
            </div>
        </body>
    );
};

export default SignUpPage;
