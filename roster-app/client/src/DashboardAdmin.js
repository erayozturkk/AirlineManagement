import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardAdmin.css';  // Ensure you have this CSS file

const DashboardAdmin = () => {

    const scheduledTasks = [
        { date: '2024-05-01', details: 'Task Details 1' },
        { date: '2024-05-05', details: 'Task Details 2' },
        { date: '2024-05-10', details: 'Task Details 3' },
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
                <Link to="/management" className="nav-item">User Management</Link>
                <Link to="/settings" className="nav-item">Settings</Link>
            </nav>
            <div className="header">
                <h1>Admin Dashboard</h1>
                <p>Welcome Admin! Manage your system settings and user tasks here.</p>
            </div>
            <div className="menu">
                <div className="menu-item">User Accounts</div>
                <div className="menu-item">System Reports</div>
                <div className="menu-item">Manage Settings</div>
            </div>
            <div className="content">
                <div className="scheduled-tasks">
                    <h2>Scheduled Tasks</h2>
                    <ul>
                        {scheduledTasks.map((task, index) => (
                            <li key={index}>
                                <span>Date: {task.date}</span> {task.details}
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

export default DashboardAdmin;
