import React from 'react';
import { useLocation } from 'react-router-dom';
import './viewFlights.css'

const ViewFlight = () => {
    const location = useLocation();
    const { flightDetails } = location.state || {};
    console.log('Flight details:', flightDetails);

    return (
        <div className="viewFlightContainer">
            <h1>Flight Details</h1>
            {flightDetails && flightDetails.length > 0 ? (
                flightDetails.map((flight, index) => (
                    <ul className="flightDetails" key={index}>
                        <li>Flight Number: {flight.flight_num}</li>
                        <li>Date: {flight.date}</li>
                        <li>Departure Airport: {flight.origin_airport_name}</li>
                        <li>Destination Airport: {flight.destination_airport_name}</li>
                    </ul>
                ))
            ) : (
                <p>No flight details found</p>
            )}
        </div>
    );
};

export default ViewFlight;
