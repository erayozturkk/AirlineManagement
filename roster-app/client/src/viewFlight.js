import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SeatMap from './SeatMap';
import ExtendedView from './ExtendedView';
import TabularView from './TabularView';
import axios from 'axios';
import './viewFlight.css';

const ViewFlight = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { flightDetails } = location.state || {}; // Add a fallback for location.state
    const [flight, setFlight] = useState(flightDetails || {}); // Initialize with flightDetails if available
    const [flightRoster, setFlightRoster] = useState(null); // State for flight_roster
    const [currentView, setCurrentView] = useState('plane'); // Default view is 'plane'
    

    useEffect(() => {
        if (flightDetails) {
            setFlight(flightDetails);
        }
        const fetchSeatingPlan = async () => {
            try {
                const response = await axios.get('http://localhost:5001/main-system/get-extended-view', {
                    params: {
                        flight_details: flightDetails,
                    }
                });
                setFlightRoster(response.data); // Set flight_roster state

            } catch (error) {
                console.error('Error fetching seating plan:', error);
            }
        };
        fetchSeatingPlan();
    }, [flightDetails]);

    const exportFlightRosterAsJson = () => {
        if (!flightRoster) {
            console.error('No flight roster available to export.');
            return;
        }
        const fileName = `flight_roster_${flight.flight_num}.json`;
        const json = JSON.stringify(flightRoster, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const href = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = href;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!flight.shared_flight_number){
        flight.shared_flight_number='-';
    }

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
                    <a href="/login" onClick={logout} className='nav-item-logout'>Sign Out</a>
                    <Link to="/settings" className='nav-item'>Settings</Link>
                </div>
            </nav>
            {flight && flight.flight_num && (
                <div className='flight-details'>
                    <p><strong>Flight Number:</strong> {flight.flight_num}</p>
                    <p><strong>Shared Flight Number:</strong> {flight.shared_flight_number}</p>
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
                    <button onClick={exportFlightRosterAsJson}>Export as JSON</button>
                </div>

                {flight && currentView === 'plane' && flightRoster && (
                    <>
                        <p><strong>Menu:</strong> {flight.flight_menu.join(', ')}</p>
                        <SeatMap flightRoster={flightRoster} />
                    </>
                )}

                {flight && currentView === 'tabular' && (
                    <>
                        <TabularView flightRoster={flightRoster} />
                    </>
                )}

                {flight && currentView === 'extended' && (
                    <>
                        <ExtendedView flightRoster={flightRoster} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ViewFlight;
