import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogInPage from './LogIn.js';
import SignUpPage from './SignUp.js';
import HomePage from './Home.js';
import ForgotPasswordPage from './ForgotPassword.js';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/login" element={<LogInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                {/* Add more Route components here for additional pages */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
