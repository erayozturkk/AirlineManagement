import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogInPage from './LogIn';
import SignUpPage from './SignUp';
import HomePage from './Home';
import ForgotPasswordPage from './ForgotPassword';
import DashboardAdmin from './DashboardAdmin';
import ViewFlight from './viewFlight';
import SeatMap from './SeatMap';
import PrivateRoute from './PrivateRoute';
import SettingsPage from './SettingsPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LogInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                    path="/forgot-password"
                    element={
                        <PrivateRoute>
                            <ForgotPasswordPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardAdmin />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/viewFlight"
                    element={
                        <PrivateRoute>
                            <ViewFlight />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/seatMap"
                    element={
                        <PrivateRoute>
                            <SeatMap />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <PrivateRoute>
                            <SettingsPage/>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
