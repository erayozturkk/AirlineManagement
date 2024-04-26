import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Import the hook
import LogInPage from './LogIn';
import SignUpPage from './SignUp';
import HomePage from './Home';
import ForgotPasswordPage from './ForgotPassword';
import DashboardPassenger from './DashboardPassenger';
import DashboardCrew from './DashboardCrew';
import DashboardAdmin from './DashboardAdmin';

function App() {
    const { user } = useUser();  // Use the user from context

    const getDashboard = () => {
        if (!user) return <Navigate to="/login" />;
        
        switch (user.userType) {
            case 'passenger':
                return <DashboardPassenger />;
            case 'admin':
                return <DashboardAdmin />;
            case 'crew':
                return <DashboardCrew />;
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;
