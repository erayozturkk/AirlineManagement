import React from 'react';
import './TabularView.css';

const TabularView = ({ flightRoster }) => {
    const CabinCrew = flightRoster.cabinCrew || {};
    const Pilots = flightRoster.pilots || {};
    const Passengers = flightRoster.passengers || {};
    // Combine all people into one array with a peopleType property
    const combinedData = [
        ...CabinCrew.map(member => ({ ...member, peopleType: 'Cabin Crew' })),
        ...Pilots.map(member => ({ ...member, peopleType: 'Pilot' })),
        ...Passengers.map(member => ({ ...member, peopleType: 'Passenger' })),
    ];

    return (
        <div className="tabular-view-container">
            <h2>Tabular View</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Nationality</th>
                        <th>People Type</th>
                    </tr>
                </thead>
                <tbody>
                    {combinedData.map((person) => (
                        <tr key={person.id}>
                            <td>{person.id}</td>
                            <td>{person.name}</td>
                            <td>{person.age}</td>
                            <td>{person.gender}</td>
                            <td>{person.nationality}</td>
                            <td>{person.peopleType}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TabularView;