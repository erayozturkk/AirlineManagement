import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardPassenger.css';  // Ensure you have this CSS file

const DashboardPassenger = () => {

    const upcomingTrips = [  // Rename for passenger context
        { date: '2024-05-01', details: 'Trip Details 1' },
        { date: '2024-05-05', details: 'Trip Details 2' },
        { date: '2024-05-10', details: 'Trip Details 3' },
    ];

    const notifications = [
        { date: '2024-04-25', details: 'Notification Details 1' },
        { date: '2024-04-26', details: 'Notification Details 2' },
        { date: '2024-04-27', details: 'Notification Details 3' },
    ];

    return (
        <div className="dashboard">
            <nav className="navbar">
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/trip-details" className="nav-item">Trip Details</Link>
                <Link to="/settings" className="nav-item">Settings</Link>
            </nav>
            <div className="header">
                <h1>Passenger Dashboard</h1>
                <p>Welcome Passenger! Here are your upcoming trips and notifications.</p>
            </div>
            <div className="menu">
                <div className="menu-item">My Trips</div>
                <div className="menu-item">Trip History</div>
                <div className="menu-item">Profile</div>
            </div>
            <div className="content">
                <div className="upcoming-trips">
                    <h2>Upcoming Trips</h2>
                    <ul>
                        {upcomingTrips.map((trip, index) => (
                            <li key={index}>
                                <span>Date: {trip.date}</span> {trip.details}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="notifications">
                    <h2>Notifications</h2>
                    <ul>
                        {notifications.map((notification, index) => (
                            <li key={index}>
                                <span>Date: {notification.date}</span> {notification.details}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPassenger;
