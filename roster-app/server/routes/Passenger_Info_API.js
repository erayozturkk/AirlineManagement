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

            let query = supabase.from('passengers').select('*');
            
            const queryParams = {
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
            };
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key]) {
                    query = query.eq(key, queryParams[key]);
                }
            });

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching passanger information:', error.message);
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
                limit,
                affiliatedpassenger
            } = req.query;
          
        let limitNumber;
        if(limit){
          limitNumber=parseInt(limit);
        }
        else{
          limitNumber=5;
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
            seatnumber: seatnumber ? parseInt(seatnumber) : null, // Will be assigned later if necessary
            parentid: parentid ? parentid : null,
            affiliatedpassenger: affiliatedpassenger ? affiliatedpassenger.map(id => parseInt(id)) : null
        };
        if(parentid){
            if(age && (age>2)){
                return res.status(400).json({ error: 'A parent cant be assigned to passangers with the age above 2' });
            }
            if(!age){
                return res.status(400).json({ error: 'A parent cant be assigned to passangers with unknown age' });
            }
            if(seatnumber){
                return res.status(400).json({ error: 'Passengers with age below 2 cant have saperete seats' });
            }
        }

        // Validate seat number if provided
        if (seatnumber) {

            // Chechk if there is a affiliated_passenger even if the passanger has a seat
            if(affiliatedpassenger){
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

        if( seatnumber && (seatnumber > max_seats)){
            throw new Error('Seat number exceeds maximum.')
            
        }

        const Layout=seatingPlan["business"].layout;
        const seatsPerRow = Layout.split('-').reduce((total, num) => total + parseInt(num), 0);
        const businessmax=seatsPerRow*seatingPlan["business"].rows;
        // Calculate seat type if not provided
        if(!seattype && !parentid){
            return res.status(400).json({ error: 'Seat type not specified' });
        }


        if (!seattype && seatnumber) {     
            if(seatnumber<=businessmax){
                passengerInfo.seattype="business";
            }
            else{
                passengerInfo.seattype="economy";
            }
        }
        if(seattype === "business" && seatnumber > businessmax){
            throw new Error('Seat type does not match seat number.')
        }
        if(seattype === "economy" && seatnumber < businessmax){
            throw new Error('Seat type does not match seat number.')
        }
        // Insert the passenger information into the Supabase table
        passengerInfo.id=nextId;
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
        }catch (error) {
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






