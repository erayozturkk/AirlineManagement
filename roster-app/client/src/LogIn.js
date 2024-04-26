import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LogIn.css';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const body = JSON.stringify(credentials);
            const response = await axios.post('http://localhost:5001/api/auth/login', body, config);
            console.log(response.data); // Handle success response
            // TODO: Save the received token to local storage or context/state
            navigate('/dashboard'); // Navigate to the dashboard upon successful login
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
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <a href="/forgot-password">Forgot Password?</a>
                <a href="/signup">Don't have an account?</a>
            </div>
        </body>
    );
};

export default LoginPage;
