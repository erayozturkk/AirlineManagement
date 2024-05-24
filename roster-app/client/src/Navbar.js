import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => (
    <nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
        <div className='navbar-nav'>
            <li className='nav-item'>
                <Link className='nav-link' to="/dashboard">Dashboard</Link>
            </li>
            <li className='nav-item'>
                <Link className='nav-link' to="/">Home</Link>
            </li>
            <li className='nav-item'>
                <Link className='nav-link' to="/management">User Management</Link>
            </li>
            <li className='nav-item'>
                <Link className='nav-link' to="/settings">Settings</Link>
            </li>
        </div>
    </nav>
);

export default Navbar;
