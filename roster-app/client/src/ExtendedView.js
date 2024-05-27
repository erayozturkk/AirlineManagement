import React from 'react';
import './ExtendedView.css';

const ExtendedView = ({ flightRoster }) => {
    const CabinCrew = flightRoster.cabinCrew;
    const Pilots = flightRoster.pilots;
    const Passengers = flightRoster.passengers

    return (
        <div className="extended-view-container">
            <h2>Extended View</h2>

            <div className="table-container">
                <h3>Pilots</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Nationality</th>
                            <th>Languages</th>
                            <th>Vehicle Restriction</th>
                            <th>Allowed Range</th>
                            <th>Seniority Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Pilots.map((pilot) => (
                            <tr key={pilot.id}>
                                <td>{pilot.id}</td>
                                <td>{pilot.name}</td>
                                <td>{pilot.age}</td>
                                <td>{pilot.gender}</td>
                                <td>{pilot.nationality}</td>
                                <td>{pilot.languages.join(', ')}</td>
                                <td>{pilot.vehicleRestriction}</td>
                                <td>{pilot.allowedRange}</td>
                                <td>{pilot.seniorityLevel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <h3>Cabin Crew</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Nationality</th>
                            <th>Languages</th>
                            <th>Attendant Type</th>
                            <th>Vehicle Restriction</th>
                            <th>Recipes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CabinCrew.map((member) => (
                            <tr key={member.id}>
                                <td>{member.id}</td>
                                <td>{member.name}</td>
                                <td>{member.age}</td>
                                <td>{member.gender}</td>
                                <td>{member.nationality}</td>
                                <td>{member.languages.join(', ')}</td>
                                <td>{member.attendanttype}</td>
                                <td>{member.vehiclerestriction.join(', ')}</td>
                                <td>{member.recipes.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <h3>Passengers</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Flight Number</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Nationality</th>
                            <th>Seat Type</th>
                            <th>Seat Number</th>
                            <th>Parent ID</th>
                            <th>Affiliated Passenger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Passengers.map((passenger) => (
                            <tr key={passenger.id}>
                                <td>{passenger.id}</td>
                                <td>{passenger.flightnum}</td>
                                <td>{passenger.name}</td>
                                <td>{passenger.age}</td>
                                <td>{passenger.gender}</td>
                                <td>{passenger.nationality}</td>
                                <td>{passenger.seattype}</td>
                                <td>{passenger.seatnumber}</td>
                                <td>{passenger.parentid}</td>
                                <td>{passenger.affiliatedpassenger}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExtendedView;