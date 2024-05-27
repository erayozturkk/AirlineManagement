const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const faker = require('faker');

// Create a new router instance
const router = express.Router();

// Function to create the flight info router
module.exports = function createFlightInfoRouter(supabaseKey) {
    // Initialize Supabase client
    const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Utility function to capitalize the first letter of each word
    function capitalizeNames(names) {
        for (let i = 0; i < names.length; i++) {
            if (names[i]) {
                names[i] = capitalizeName(names[i])
            }
        }
    }
    function capitalizeName(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    function capitalizeInput(input) {
        if (input & typeof input === 'string') {
            return capitalizeName(input);
        } else if (Array.isArray(input)) {
            return capitalizeNames(input);
        } else {
            throw new Error("Input must be a string or an array of strings");
        }
    }


    // Endpoint to get passengers
    router.get('/get-passengers', async (req, res) => {
        try {
            const {
                id,
                flightnum,
                name,
                age,
                gender,
                nationality,
                seattype,
                seatnumber,
                parentid,
                affiliatedpassenger
            } = req.query;

            const validSeatTypes = ["business", "economy"];
            if (seattype && !validSeatTypes.includes(seattype)) {
                return res.status(400).json({ error: `Invalid seattype provided: ${seattype}`, validSeatTypes: validSeatTypes });
            }
            if (id && isNaN(id)) {
                return res.status(400).json({ error: `id should be an integer id: ${id}` });
            }

            let query = supabase.from('passengers').select('*');

            const queryParams = {
                id: id ? parseInt(id) : undefined,
                flightnum,
                name,
                age: age ? parseInt(age) : undefined,
                gender,
                nationality,
                seattype,
                seatnumber,
                parentid: parentid ? parseInt(parentid) : undefined,
                affiliatedpassenger
            };

            Object.keys(queryParams).forEach(key => {
                const value = queryParams[key];
                if (value !== undefined && value !== null) {
                    if (key === 'affiliatedpassenger') {
                        // Ensure affiliatedpassenger is handled as an array
                        const affiliatedArray = Array.isArray(value) ? value : [value];
                        query = query.contains(key, affiliatedArray);
                    } else if (Array.isArray(value)) {
                        query = query.in(key, value);
                    } else {
                        query = query.eq(key, value);
                    }
                }
            });

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching passenger information:', error.message);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json(data);
        } catch (error) {
            console.error('Supabase connection error:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


    router.post('/add-passenger-info', async (req, res) => {
        try {
            let {
                id,
                flightnum,
                name,
                age,
                gender,
                nationality,
                seattype,
                seatnumber,
                parentid,
                limit,
                affiliatedpassenger
            } = req.query;

            if (limit && (isNaN(limit) || limit < 1)) {
                return res.status(400).json({ error: `Limit should be a positive integer limit: ${limit}` });
            }
            if (id && isNaN(id)) {
                return res.status(400).json({ error: `id should be an integer id: ${id}` });
            }


            let limitNumber;
            if (limit) {
                limitNumber = parseInt(limit);
            }
            else {
                limitNumber = 5;
            }
            // Input checks 

            if ((limit > 1) && seatnumber && limit) {
                return res.status(400).json({ error: `You cant assign more than one passenger to the same seat` });
            }
            const validSeatTypes = ["business", "economy"];

            if (seattype && !validSeatTypes.includes(seattype)) {
                return res.status(400).json({ error: `Invalid seattype provided: ${seattype}`, validSeatTypes: validSeatTypes });
            }
            if (age && ((0 >= age) || isNaN(age))) {
                return res.status(400).json({ error: 'Age must be a non negative integer', age: age });
            }

            const { data: existingFlights, error: flightInfoError } = await supabase
                .from('flight_info')
                .select('flight_num, shared_flight_number, vehicle_type')
                .or(`flight_num.eq.${flightnum},shared_flight_number.eq.${flightnum}`);
            if (flightInfoError) {
                throw flightInfoError;
            }

            if (existingFlights.length === 0) {
                return res.status(400).json({ error: 'Flight number not found' });
            }



            const vehicleType = existingFlights[0].vehicle_type;

            const { data: aircraftData, error: aircraftDataError } = await supabase
                .from('aircrafts')
                .select('seatingplan, numberofseats')
                .eq('vehicletype', vehicleType);

            if (aircraftDataError) {
                throw aircraftDataError;
            }
            const max_seats = aircraftData[0].numberofseats;

            const { data: passanger, error: passengerError } = await supabase
                .from('passengers')
                .select('*')
                .eq('flightnum', flightnum);
            const numberofpassengers = passanger.length;
            if ((numberofpassengers + limitNumber) > max_seats) {
                return res.status(400).json({ error: 'There is not enough seats left for this number of passengers: ' }, limit);
            }
            const seatingPlan = aircraftData[0].seatingplan;
            const addedPassengers = [];
            const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
                .from('people')
                .select('id')
                .order('id', { ascending: false })
                .limit(1);

            if (lastCrewMemberError) {
                throw lastCrewMemberError;
            }

            // Calculate the next available id
            let nextId = lastCrewMember.length > 0 ? lastCrewMember[0].id + 1 : 1;

            const arr = [name, gender, nationality];
            capitalizeInput(arr)
            name = arr[0];
            gender = arr[1];
            nationality = arr[2];


            for (let i = 0; i < limitNumber; i++) {
                // Generate random passenger information if not provided
                const passengerInfo = {
                    id: id,
                    flightnum: flightnum,
                    name: name ? name : faker.name.findName(),
                    age: age ? parseInt(age) : faker.datatype.number({ min: 3, max: 100 }),
                    gender: gender ? gender : faker.random.arrayElement(["Male", "Female"]),
                    nationality: nationality ? nationality : faker.address.country(),
                    seattype: seattype ? seattype : null, // Will be calculated later if necessary
                    seatnumber: seatnumber ? seatnumber : null, // Will be assigned later if necessary
                    parentid: parentid ? parentid : null,
                    affiliatedpassenger: affiliatedpassenger ? affiliatedpassenger.map(id => parseInt(id)) : null
                };

                if (parentid) {
                    if (age && (age > 2)) {
                        return res.status(400).json({ error: 'A parent cant be assigned to passangers with the age above 2' });
                    }
                    if (!age) {
                        return res.status(400).json({ error: 'A parent cant be assigned to passangers with unknown age' });
                    }
                    if (seatnumber) {
                        return res.status(400).json({ error: 'Passengers with age below 2 cant have saperete seats' });
                    }
                }

                // Validate seat number if provided
                if (seatnumber) {

                    // Chechk if there is a affiliated_passenger even if the passanger has a seat
                    if (affiliatedpassenger) {
                        return res.status(400).json({ error: 'Passangers cant choose to sit next to affiliated passengers if they have a seat number' });
                    }

                    // Check if the seat number is unique for the given flight
                    const { data: existingPassengers, error: passengerError } = await supabase
                        .from('passengers')
                        .select('seatnumber')
                        .eq('flightnum', flightnum)
                        .eq('seatnumber', seatnumber);

                    if (passengerError) {
                        throw passengerError;
                    }

                    if (existingPassengers.length > 0) {
                        return res.status(400).json({ error: 'Seat number already assigned to another passenger' });
                    }
                }


                // Determine seating plan based on vehicle type
                const LayoutB = seatingPlan["business"].layout;
                const LayoutE = seatingPlan["economy"].layout;
                const seatsPerRowB = LayoutB.split('-').reduce((total, num) => total + parseInt(num), 0);
                const seatsPerRowE = LayoutE.split('-').reduce((total, num) => total + parseInt(num), 0);
                const businessmax = seatsPerRowB * seatingPlan["business"].rows;
                var seatnumberint = seatnumber;




                if (seatnumber) {
                    if (!seattype) {

                        if (seatnumber.slice(0, -1) <= seatingPlan["business"].rows) {
                            passengerInfo.seattype = "business";
                        }
                        else {
                            passengerInfo.seattype = "economy";
                        }
                    }

                    if (passengerInfo.seattype == 'business') {
                        if (65 <= parseInt(seatnumber.charCodeAt(seatnumber.length - 1)) <= 64 + seatsPerRowB) {
                            var seatnumberint = (seatnumber.charCodeAt(seatnumber.length - 1) - 64) + (seatsPerRowB * (parseInt(seatnumber.slice(0, -1)) - 1));
                        }
                        else {
                            throw new Error('Seat number does not exist for seat type.')
                        }
                    }
                    if (passengerInfo.seattype == 'economy') {
                        if (65 <= seatnumber.charCodeAt(seatnumber.length - 1) <= 64 + seatsPerRowE) {
                            var seatnumberint = businessmax + (seatnumber.charCodeAt(seatnumber.length - 1) - 64) + seatsPerRowE * (parseInt(seatnumber.slice(0, -1)) - seatingPlan["business"].rows - 1);
                        }
                        else {
                            throw new Error('Seat number does not exist for seat type.')
                        }
                    }
                }


                if (seatnumber && (seatnumberint > max_seats)) {
                    throw new Error('Seat number exceeds maximum.')

                }


                // Calculate seat type if not provided
                if (!seattype && !parentid && !seatnumber) {
                    return res.status(400).json({ error: 'Seat type not specified' });
                }

                if ((seattype === "business") && (seatnumberint > businessmax)) {
                    throw new Error('Seat type does not match seat number.')
                }
                if ((seattype === "economy") && (seatnumberint < businessmax)) {
                    throw new Error('Seat type does not match seat number.')
                }
                // Insert the passenger information into the Supabase table
                passengerInfo.id = nextId;
                nextId++;

                addedPassengers.push(passengerInfo);

            }
            const { data: insertedPassengerInfo, error: insertError } = await supabase
                .from('passengers')
                .insert(addedPassengers);

            if (insertError) {
                throw insertError;
            }
            res.status(201).json({ message: 'Passenger information added successfully', addedPassengers });
        } catch (error) {
            console.error('Error adding passanger information:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.put('/update-passengers', async (req, res) => {
        try {
            const { passengerarray } = req.body; // Expecting an array of passenger objects

            // Iterate over the list of passengers and update each one
            const updates = passengerarray.map(async (passenger) => {
                const { id, ...updateData } = passenger;

                // Perform the update operation
                const { data, error } = await supabase
                    .from('passengers')
                    .update(updateData)
                    .eq('id', id);

                if (error) {
                    throw error;
                }
                return data;
            });

            // Wait for all updates to complete
            const updatedPassengers = await Promise.all(updates);

            res.status(200).json({ message: 'Passengers updated successfully' });
        } catch (error) {
            console.error('Error updating passenger information:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}






