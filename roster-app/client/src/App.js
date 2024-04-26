import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LogInPage from './LogIn.js';
import SignUpPage from './SignUp.js';
import HomePage from './Home.js';
import ForgotPasswordPage from './ForgotPassword.js';
import PassengerDashboard from './PassengerDashboard.js'; // Renamed from UserDashboard
import CrewDashboard from './CrewDashboard.js';
import AdminDashboard from './AdminDashboard.js';
import { UserContext } from './UserContext.js'; // You'll need to create this

function App() {
    // This state would ideally come from your global state/context
    const { userType } = React.useContext(UserContext);

    const getDashboard = () => {
        switch (userType) {
            case 'user':
                return <PassengerDashboard />; // Updated to new component name
            case 'admin':
                return <AdminDashboard />;
            case 'crew':
                return <CrewDashboard />;
            default:
                return <Navigate to="/login" />;
        }
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LogInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/dashboard" element={getDashboard()} />
                {/* Add more Route components here for additional pages */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
