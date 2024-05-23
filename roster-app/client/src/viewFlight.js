import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SeatMap from './SeatMap';
import './viewFlight.css';

const TabularView = ({ passengers }) => {
    if (!passengers || passengers.length === 0) {
        return <p>No passengers available for this flight.</p>;
    }

    return (
        <table className="flight-table">
            <thead>
                <tr>
                    <th>Passenger Name</th>
                    <th>Seat Number</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Special Assistance</th>
                </tr>
            </thead>
            <tbody>
                {passengers.map((passenger, index) => (
                    <tr key={index}>
                        <td>{passenger.name}</td>
                        <td>{passenger.seat_number}</td>
                        <td>{passenger.age}</td>
                        <td>{passenger.gender}</td>
                        <td>{passenger.special_assistance ? 'Yes' : 'No'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const ViewFlight = () => {
    const location = useLocation();
    const { flightDetails } = location.state || {}; // Add a fallback for location.state
    const [flight, setFlight] = useState(flightDetails || {}); // Initialize with flightDetails if available
    const [currentView, setCurrentView] = useState('plane'); // Default view is 'plane'

    console.log('Flight details:', flightDetails);

    useEffect(() => {
        if (flightDetails) {
            console.log('Setting flight:', flightDetails);
            setFlight(flightDetails);
        }
    }, [flightDetails]);

    return (
        <div className="view-flight-page">
            <nav className='viewflight-navbar'>
                <div className="left-section">
                    <Link to="/dashboard">
                        <img src="./logowhite.png" alt="Logo" className="logo" />
                    </Link>
                </div>
                <h1 className='header'>Flight Details</h1>
                <div className="right-section">
                    <Link to="/dashboard" className='nav-item'>Home</Link>
                </div>
            </nav>
            {flight && flight.flight_num && (
                <div className='flight-details'>
                    <p><strong>Flight Number:</strong> {flight.flight_num}</p>
                    <p><strong>Date:</strong> {flight.date}</p>
                    <p><strong>Time: </strong>{flight.time}</p>
                    <p><strong>Origin Airport:</strong> {flight.origin_airport_name}</p>
                    <p><strong>Origin Airport Code:</strong> {flight.origin_airport_code}</p>
                    <p><strong>Destination Airport:</strong> {flight.destination_airport_name}</p>
                    <p><strong>Destination Airport Code:</strong> {flight.destination_airport_code}</p>
                    <p><strong>Distance:</strong> {flight.distance} KM</p>
                    <p><strong>Vehicle:</strong> {flight.vehicle_type}</p>
                </div>
            )}
            <div className='view-flight-container'>
                <div className="view-buttons">
                    <button onClick={() => setCurrentView('plane')}>Plane Map View</button>
                    <button onClick={() => setCurrentView('tabular')}>Tabular View</button>
                    <button onClick={() => setCurrentView('extended')}>Extended View</button>
                </div>

                {flight && currentView === 'plane' && (
                    <>
                        <SeatMap flight={flight} />
                    </>
                )}

                {flight && currentView === 'tabular' && (
                    <>
                        <TabularView passengers={flight.passengers} />
                    </>
                )}

                {flight && currentView === 'extended' && (
                    <>
                        {/* Extended View Component */}
                        <div>Extended View</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ViewFlight;