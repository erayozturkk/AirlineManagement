import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardCrew.css';



const DashboardCrew = () => {

    const upcomingFlights = [
        { date: '2024-05-01', details: 'Flight Details 1' },
        { date: '2024-05-05', details: 'Flight Details 2' },
        { date: '2024-05-10', details: 'Flight Details 3' },
    ];

    // Dummy data for notifications
    const notifications = [
        { date: '2024-04-25', details: 'Notification Details 1' },
        { date: '2024-04-26', details: 'Notification Details 2' },
        { date: '2024-04-27', details: 'Notification Details 3' },
    ];

    return (
        <div className="dashboard">
            <nav className="navbar">
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/flight-roster" className="nav-item">Flight Roster</Link>
                <Link to="/settings" className="nav-item">Settings</Link>
            </nav>
            <div className="header">
                <h1>Dashboard</h1>
                <p>Welcome User! This is your flight roster management system.</p>
            </div>
            <div className="menu">
                <div className="menu-item">Flight Roster</div>
                <div className="menu-item">Records</div>
                <div className="menu-item">My Flights</div>
            </div>
            <div className="content">
                <div className="upcoming-flights">
                    <h2>Upcoming Flights</h2>
                    <ul>
                            {upcomingFlights.map((flight, index) => (
                                <li key={index}>
                                    <span>Date: {flight.date}</span> {flight.details}
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

export default DashboardCrew;