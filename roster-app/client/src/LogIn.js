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
            navigate('/dashboard');
        } catch (err) {
            console.error("Login error:", err.response.data);
        }
    };



    return (
        <body id='loginpage'>
            <div className="login-logo-container">
                <img src="./logo.png" alt="logo" id='login-logo-img' />
            </div>
            <div className='login-form-container'>
                <h2>FLIGHT ROSTER APPLICATION</h2>
                <form onSubmit={handleSubmit}>
                    <div className='input_group'>
                        <input type="text" placeholder="Username" name="username" value={credentials.username} onChange={handleChange} required />
                    </div>
                    <div className='input_group'>
                        <input type="password" placeholder="Password" name="password" value={credentials.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" id='loginbutton'>Login</button>
                </form>
                <a href="/forgot-password">Forgot Password?</a>
                <a href="/signup">Don't have an account? Sign up here</a>
            </div>
        </body>
    );
};

export default LoginPage;
