import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './SignUp.css';

const SignUpPage = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'passenger' // Set default userType to 'passenger'
    });

    const { username, email, password, confirmPassword } = userData;
    const navigate = useNavigate(); // Hook for navigation

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            console.error("Passwords don't match!");
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const body = JSON.stringify({ username, email, password, userType: userData.userType });
            const registerResponse = await axios.post('http://localhost:5001/api/auth/register', body, config);

            if (registerResponse.status === 201) {
                // Perform login after successful registration
                const loginResponse = await axios.post('http://localhost:5001/api/auth/login', { username, password }, config);

                if (loginResponse.status === 200) {
                    console.log('Sign up & Login successful:', loginResponse.data);
                    // Assuming you store the token in localStorage or context
                    localStorage.setItem('token', loginResponse.data.token);

                    navigate('/dashboard'); // Redirect to the dashboard
                }
            }
        } catch (err) {
            console.error('Registration Error:', err.response ? err.response.data : err);
        }
    };

    return (
        <body className='signup-page'>
            <div className="signup-logo">
                <img src="./logo.png" alt="logo" />
            </div>
            <div className="signup-container">
                <div className="signup-form">
                    <h2>FLIGHT ROSTER APPLICATION</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
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
                                name="password"
                                value={password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" id='signupbutton'>Sign Up</button>
                    </form>
                    <a href="/login">Already have an account? Log in here</a>
                </div>
            </div>
        </body>
    );
};

export default SignUpPage;
