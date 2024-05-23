import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SeatMap.css';
const SeatMap = ({ flightRoster }) => {
    const [seatingPlan, setSeatingPlan] = useState(null);
    const [aircraftInfo, setAircraftInfo] = useState(null);
    const vehicleType = flightRoster?.vtype; // Ensure flightRoster is not null

    useEffect(() => {
        const fetchAircraftInfo = async (vehicle_type) => {
            try {
                const response = await axios.get('http://localhost:5001/aircraft/aircraft_info', {
                    params: {
                        vehicle_type: vehicle_type,
                    },
                });
                console.log('Response:', response.data[0]);
                setAircraftInfo(response.data[0]);
                setSeatingPlan(response.data[0].seatingplan)

            } catch (error) {
                console.error('Error fetching aircraft info:', error);
            }
        };

        if (vehicleType) {
            fetchAircraftInfo(vehicleType);
            console.log('Aircraft: ', aircraftInfo, 'SeatingPlan:', seatingPlan)
        }
    }, [vehicleType]); // Only re-run the effect if vehicleType changes

    return (
        <div className="seat-map-container">
            {seatingPlan ? (
                <>
                    <SeatingSection classType="Business" seatingPlan={seatingPlan.business} startRow={0} />
                    <SeatingSection classType="Economy" seatingPlan={seatingPlan.economy} startRow={seatingPlan.business.rows} />
                </>
            ) : (
                <p>Loading seating plan...</p>
            )}
        </div>
    );
};




const SeatingSection = ({ classType, seatingPlan, startRow }) => {
    const { rows, layout } = seatingPlan;
    const layoutArr = layout.split('-').map(Number);

    let currentRow = startRow;

    return (
        <div className={`seating-section ${classType.toLowerCase()}`}>
            <h3>{classType} Class</h3>
            {Array.from({ length: rows }).map((_, rowIndex) => {
                const rowNumber = currentRow + 1; // Calculate the current row number before rendering seats
                let letterIndex = 0; // Reset letter index for each row

                const seatRow = (
                    <div key={rowIndex} className="seat-row">
                        {layoutArr.map((seats, layoutIndex) => (
                            <div key={layoutIndex} className="seat-block">
                                {Array.from({ length: seats }).map((_, seatIndex) => {
                                    const seatId = `${String.fromCharCode(65 + letterIndex)}${rowNumber}`;
                                    letterIndex++;
                                    return (
                                        <div key={seatIndex} id={seatId} className="seat">
                                            {seatId}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                );

                currentRow++; // Increment currentRow only after completing the row
                return seatRow;
            })}
        </div>
    );
};
export default SeatMap;