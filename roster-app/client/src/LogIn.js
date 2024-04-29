import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import './LogIn.css';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const { setUser } = useUser();
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
            console.log("Login response data:", response.data);
            
            setUser({
                token: response.data.token,
                userDetails: response.data.userDetails
            });

            localStorage.setItem('user', JSON.stringify({
                token: response.data.token,
                userDetails: response.data.userDetails
            }));

            // Navigate directly after setting the user in context and local storage
            navigate('/dashboard');
        } catch (err) {
            console.error("Login error:", err.response.data);
        }
    };

    return (
        <div className="login-container">
            <h2>FLIGHT ROSTER APPLICATION</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input type="text" placeholder="Username" name="username" value={credentials.username} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="password" placeholder="Password" name="password" value={credentials.password} onChange={handleChange} required />
                </div>
                <button type="submit">Login</button>
            </form>
            <a href="/forgot-password">Forgot Password?</a>
            <a href="/signup">Don't have an account? Sign up here</a>
        </div>
    );
};

export default LoginPage;
