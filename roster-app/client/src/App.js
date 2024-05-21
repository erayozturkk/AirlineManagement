import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogInPage from './LogIn';
import SignUpPage from './SignUp';
import HomePage from './Home';
import ForgotPasswordPage from './ForgotPassword';
import DashboardAdmin from './DashboardAdmin';
import ViewFlight from './viewFlight';
import SeatMap from './SeatMap';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LogInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/dashboard" element={<DashboardAdmin />} />
                <Route path="/viewFlight" element={<ViewFlight />} />
                <Route path="/seatMap" element={<SeatMap />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
