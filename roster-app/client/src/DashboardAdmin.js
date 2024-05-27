import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardAdmin.css';
import axios from 'axios';

const DashboardAdmin = () => {
    const [flightNumber, setFlightNumber] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [departureAirport, setDepartureAirport] = useState('');
    const [destinationAirport, setDestinationAirport] = useState('');
    const [departureCity, setDepartureCity] = useState('');
    const [destinationCity, setDestination] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchMode, setSearchMode] = useState('flightNumber'); // 'flightNumber' or 'filter'
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (event) => {
        event.preventDefault();
        if ((year || month || day) && (!year || !month || !day)) {
            alert("Invalid Date Format, please provide a complete date.");
            return;
        }
        const date = (year && month && day) ? `${year}-${day.padStart(2, '0')}-${month.padStart(2, '0')}` : '';
        const flight_num = flightNumber.toUpperCase();
        const dep_airport_code = departureAirport.toUpperCase();
        const dest_airport_code = destinationAirport.toUpperCase();
        console.log('Flight_num:', flight_num);

        try {
            const response = await axios.get('http://localhost:5001/flight-info/find_flight_information', {
                params: {
                    flight_num: flight_num,
                    date: date,
                    origin_city: departureCity,
                    origin_airport_code: dep_airport_code,
                    destination_airport_code: dest_airport_code,
                    destination_city: destinationCity
                }
            });

            const flights = response.data.map(flight => ({
                ...flight,
                rosterGenerated: flight.rosterGenerated || false // Ensure rosterGenerated is set
            }));

            console.log('Processed Flights:', flights);
            setSearchResults(flights);
            setFlightNumber('');
            setDay('');
            setMonth('');
            setYear('');
            setDepartureAirport('');
            setDestinationAirport('');
            setDepartureCity('');
            setDestination('');
        } catch (error) {
            console.error('Error fetching flight data:', error);
            // Optionally handle the error, e.g., show an error message in your UI
        }
    };

    const handleGenerateRoster = async (flight) => {
        setLoading(true); // Set loading to true when generating roster
        try {
            const response = await axios.post('http://localhost:5001/main-system/generate-flight-roster', {
                flight_info: flight,
            });
            console.log(response.data);
            setLoading(false); // Set loading to false when done
            navigate('/viewFlight', {
                state: {
                    flightDetails: flight
                }
            });
        } catch (error) {
            console.error('Error generating roster:', error);
            setLoading(false); // Set loading to false even if there is an error
        }
    };

    const handleViewRoster = (flight) => {
        navigate('/viewFlight', {
            state: {
                flightDetails: flight
            }
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className='dashboard-page'>
            {loading && (
                <div className='loading-screen'>
                    <p>Loading...</p>
                </div>
            )}
            <nav className='dashboard-navbar'>
                <Link to="/dashboard">
                    <img src="./logowhite.png" alt="Logo" className="logo" />
                </Link>
                <h1 className='header'>Admin Dashboard</h1>
                <a href="/login" onClick={logout} className='nav-item-logout'>Sign Out</a>
                <Link to="/settings" className='nav-item'>Settings</Link>
            </nav>
            <div className='dashboard-header'>
                <p>Welcome Admin! Select a flight below.</p>
            </div>
            <div className="search-toggle">
                <button type="button" onClick={() => setSearchMode('flightNumber')} className={searchMode === 'flightNumber' ? 'active' : ''}>
                    Search by Flight Number
                </button>
                <button type="button" onClick={() => setSearchMode('filter')} className={searchMode === 'filter' ? 'active' : ''}>
                    Search by Filter
                </button>
            </div>
            <div className='dashboard-menu'>
                <form className='searchform' onSubmit={handleSearch}>
                    <div className='input_container'>
                        {searchMode === 'flightNumber' && (
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
                        )}
                        {searchMode === 'filter' && (
                            <div className='dashboard-menu-item'>
                                <div className='filter'>
                                    <label htmlFor="date">Date</label>
                                    <div id='Date_Container'>
                                        <input
                                            type="text"
                                            placeholder="Day"
                                            value={day}
                                            onChange={(e) => setDay(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Month"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Year"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='filter'>
                                    <label htmlFor="departureCity">Departure City</label>
                                    <input
                                        type="text"
                                        id="departureCity"
                                        name="departureCity"
                                        placeholder="Enter departure city"
                                        value={departureCity}
                                        onChange={(e) => setDepartureCity(e.target.value)}
                                    />
                                </div>
                                <div className='filter'>
                                    <label htmlFor="departureAirport">Departure Airport Code</label>
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
                                    <label htmlFor="destinationCity">Destination City</label>
                                    <input
                                        type="text"
                                        id="destinationCity"
                                        name="destinationCity"
                                        placeholder="Enter destination city"
                                        value={destinationCity}
                                        onChange={(e) => setDestination(e.target.value)}
                                    />
                                </div>
                                <div className='filter'>
                                    <label htmlFor="destinationAirport">Destination Airport Code</label>
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
                        )}
                    </div>
                    <button type="submit">Search Flights</button>
                </form>
            </div>
            <div className='results-section'>
                {searchResults.length > 0 && (
                    <div>
                        <h2>Results</h2>
                        <ul>
                            {searchResults.map((flight, index) => (
                                <li key={index} className='result-item'>
                                    <div>
                                        <p><strong>Flight Number:</strong> {flight.flight_num}</p>
                                        <p><strong>Date:</strong> {flight.date}</p>
                                        <p><strong>Origin Airport:</strong> {flight.origin_airport_code}</p>
                                        <p><strong>Destination Airport:</strong> {flight.destination_airport_code}</p>
                                    </div>
                                    <div className='result-buttons'>
                                        <button
                                            onClick={() => handleGenerateRoster(flight)}
                                            disabled={flight.rosterGenerated}
                                        >
                                            Generate Roster
                                        </button>
                                        <button
                                            onClick={() => handleViewRoster(flight)}
                                            disabled={!flight.rosterGenerated}
                                        >
                                            View Roster
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {searchResults && searchResults.length === 0 && (
                    <div>
                        <h2>No Results</h2>
                        <p>No flights found.</p>
                    </div>
                )
                }
            </div>
        </div>
    );
};

export default DashboardAdmin;

