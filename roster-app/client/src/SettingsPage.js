import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SettingsPage.css';
import Navbar from './Navbar';

const SettingsPage = () => {
    const [userData, setUserData] = useState({
        username: 'currentUsername', // Replace with actual data from your state or props
        email: 'user@example.com', // Replace with actual data from your state or props
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercase: false,
        specialChar: false,
    });

    const { username, email, currentPassword, newPassword, confirmNewPassword } = userData;
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const length = password.length >= 8 && password.length <= 16;
        const uppercase = /[A-Z]/.test(password);
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        setPasswordValidations({ length, uppercase, specialChar });
    };

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
        if (e.target.name === 'newPassword') {
            validatePassword(e.target.value);
        }
        if (e.target.name === 'confirmNewPassword') {
            if (e.target.value !== newPassword) {
                e.target.setCustomValidity("Passwords don't match!");
            } else {
                e.target.setCustomValidity('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            alert("Passwords don't match! Please try again.");
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const body = JSON.stringify({ currentPassword, newPassword });
            const response = await axios.post('http://localhost:5001/auth/update-password', body, config);

            if (response.status === 200) {
                console.log('Password updated successfully:', response.data);
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Update Error:', err.response ? err.response.data : err);
            alert(err.response ? err.response.data.message : 'An error occurred. Please try again.');
        }
    };

    return (
        <div className='container-fluid p-0'>
            <Navbar />
            <div className='container mt-5'>
                <div className='card'>
                    <div className='card-body'>
                        <h2 className='card-title'>Settings</h2>
                        <form onSubmit={handleSubmit}>
                            <div className='form-group'>
                                <label htmlFor='username'>Username</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='username'
                                    name='username'
                                    value={username}
                                    readOnly
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='email'>Email</label>
                                <input
                                    type='email'
                                    className='form-control'
                                    id='email'
                                    name='email'
                                    value={email}
                                    readOnly
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='currentPassword'>Current Password</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    id='currentPassword'
                                    name='currentPassword'
                                    value={currentPassword}
                                    onChange={handleChange}
                                    placeholder='Enter your current password'
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='newPassword'>New Password</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    id='newPassword'
                                    name='newPassword'
                                    value={newPassword}
                                    onChange={handleChange}
                                    placeholder='Enter your new password'
                                />
                            </div>
                            <div className='password-validations'>
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
                            <div className='form-group'>
                                <label htmlFor='confirmNewPassword'>Confirm New Password</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    id='confirmNewPassword'
                                    name='confirmNewPassword'
                                    value={confirmNewPassword}
                                    onChange={handleChange}
                                    placeholder='Confirm your new password'
                                />
                            </div>
                            <button type='submit' className='btn btn-primary'>Update Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
