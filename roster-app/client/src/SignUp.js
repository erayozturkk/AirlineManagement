import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUpPage = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'admin'
    });

    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercase: false,
        specialChar: false
    });


    const { username, email, password, confirmPassword } = userData;
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const length = password.length >= 8 && password.length <= 16;
        const uppercase = /[A-Z]/.test(password);
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        setPasswordValidations({ length, uppercase, specialChar });
    };

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
        if (e.target.name === 'password') {
            validatePassword(e.target.value);
        }
        if (e.target.name === 'confirmPassword') {
            if (e.target.value !== password) {
                e.target.setCustomValidity("Passwords don't match!");
            } else {
                e.target.setCustomValidity('');
            }
        }
        if (e.target.name === 'username') {
            if (e.target.value.length <= 4) {
                e.target.setCustomValidity("Username must be at least 5 characters long!");
            } else {
                e.target.setCustomValidity('');
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            console.error("Passwords don't match!");
            alert("Passwords don't match! Please try again.");
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const body = JSON.stringify({ username, email, password, userType: userData.userType });
            const registerResponse = await axios.post('http://localhost:5001/auth/register', body, config);

            if (registerResponse.status === 201) {
                const loginResponse = await axios.post('http://localhost:5001/auth/login', { username, password }, config);

                if (loginResponse.status === 200) {
                    console.log('Sign up & Login successful:', loginResponse.data);
                    localStorage.setItem('token', loginResponse.data.token);
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error('Registration Error:', err.response ? err.response.data : err);
            alert(err.response.data.message);
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
                        <div className="password-validations">
                            <p className={passwordValidations.length ? 'valid' : 'invalid'}>
                                Password must be between 8-16 characters.
                            </p>
                            <p className={passwordValidations.uppercase ? 'valid' : 'invalid'}>
                                Password must include at least 1 uppercase letter.
                            </p>
                            <p className={passwordValidations.specialChar ? 'valid' : 'invalid'}>
                                Password must include at least 1 special character.
                            </p>
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
