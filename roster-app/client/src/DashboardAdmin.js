import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardAdmin.css';
import axios from 'axios';

const DashboardAdmin = () => {
    const [flightNumber, setFlightNumber] = useState('');
    const [date, setDate] = useState('');
    const [departureAirport, setDepartureAirport] = useState('');
    const [destinationAirport, setDestinationAirport] = useState('');
    const navigate = useNavigate();

    const handleSearch = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.get('http://localhost:5001/find_flight_information', {
                params: {
                    flight_num: flightNumber,
                    date: date,
                    origin_airport_code: departureAirport,
                    destination_airport_code: destinationAirport
                }
            });
            navigate('/viewFlight', {
                state: {
                    flightDetails: response.data
                }
            });
        } catch (error) {
            console.error('Error fetching flight data:', error);
            // Optionally handle the error, e.g., show an error message in your UI
        }
    };


    return (
        <body className='dashboard-page'>
            <nav className='dashboard-navbar'>
                <Link to="/" className='nav-item'>Home</Link>
                <Link to="/management" className='nav-item'>User Management</Link>
                <Link to="/settings" className='nav-item'>Settings</Link>
            </nav>
            <div className='dashboard-header'>
                <h1>Admin Dashboard</h1>
                <p>Welcome Admin! Select a flight below.</p>
            </div>
            <div className='dashboard-menu'>
                <form onSubmit={handleSearch}>
                    <div className='input_container'>
                        <div className='dashboard-menu-item'>
                            <label htmlFor="flightNumber">Flight Number</label>
                            <input
                                type="text"
                                id="flightNumber"
                                name="flightNumber"
                                placeholder="Enter flight number"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value)}
                            />
                        </div>
                        <div className='dashboard-menu-item'>
                            <div className="filter">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className='filter'>
                                <label htmlFor="departureAirport">Departure Airport</label>
                                <input
                                    type="text"
                                    id="departureAirport"
                                    name="departureAirport"
                                    placeholder="Enter departure airport"
                                    value={departureAirport}
                                    onChange={(e) => setDepartureAirport(e.target.value)}
                                />
                            </div>
                            <div className='filter'>
                                <label htmlFor="destinationAirport">Destination Airport</label>
                                <input
                                    type="text"
                                    id="destinationAirport"
                                    name="destinationAirport"
                                    placeholder="Enter destination airport"
                                    value={destinationAirport}
                                    onChange={(e) => setDestinationAirport(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit">Search Flights</button>
                </form>
            </div>
        </body>
    );
};

export default DashboardAdmin;

