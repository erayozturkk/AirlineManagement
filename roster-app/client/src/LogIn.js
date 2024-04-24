import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LogIn.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log(username, password);
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
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Link to="/dashboard">
                        <button type="submit">Login</button>
                    </Link>
                </form>
                <a href="/forgot-password">Forgot Password?</a>
                <a href="/signup">Don't have an account?</a>
            </div>
        </body>
    );
};

export default LoginPage;

