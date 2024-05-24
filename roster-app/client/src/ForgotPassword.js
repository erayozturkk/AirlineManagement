import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle forgot password logic here
        console.log(email);
    };

    return (
        <body className='forgot-password'>
            <div className="login-logo">
                <img src="./logo.png" alt="logo" className='login-logo' />
            </div>
            <div className="password-container">
                <h2>FLIGHT ROSTER APPLICATION</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit">Reset Password</button>
                </form>
                <Link to="/login">Back to Login</Link>
            </div>
        </body>
    );
};

export default ForgotPasswordPage;
