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
                passengerid,
                flightnum,
                name,
                age,
                gender,
                nationality,
                seattype,
                seatnumber,
                parentid
            } = req.query;

            let query = supabase.from('passengers').select('*');
            
            const queryParams = {
                passengerid,
                flightnum,
                name,
                age,
                gender,
                nationality,
                seattype,
                seatnumber,
                parentid
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
                limit
            } = req.query;
          
        let limitNumber;
        if(limit){
          limitNumber=parseInt(limit);
        }
        else{
          limitNumber=5;
        }
        const addedPassengers = [];
          for (let i = 0; i < limitNumber; i++) {
            
            const { data: existingFlights, error: flightInfoError } = await supabase
            .from('flight_info')
            .select('flight_num')
            .eq('flight_num', flightnum)

        if (flightInfoError) {
            throw flightInfoError;
        }

        if (existingFlights.length === 0) {
            return res.status(400).json({ error: 'Flight number not found' });
        }

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
            parentid: parentid ? parentid : null
        };

        // Validate seat number if provided
        if (seatnumber) {
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

        // Determine seating plan based on vehicle type from flight_info table
        const { data: flightInfoData, error: flightInfoDataError } = await supabase
            .from('flight_info')
            .select('vehicle_type')
            .eq('flight_num', flightnum);

        if (flightInfoDataError) {
            throw flightInfoDataError;
        }

        const vehicleType = flightInfoData[0].vehicle_type;

        // Determine seating plan based on vehicle type
        const { data: aircraftData, error: aircraftDataError } = await supabase
            .from('aircrafts')
            .select('seatingplan')
            .eq('vehicletype', vehicleType);

        if (aircraftDataError) {
            throw aircraftDataError;
        }

        const seatingPlan = aircraftData[0].seatingplan;

        // Calculate seat type if not provided
        if (!seattype && seatnumber) {
            const Layout=seatingPlan["business"].layout;
            const seatsPerRow = Layout.split('-').reduce((total, num) => total + parseInt(num), 0);
            const businessmax=seatsPerRow*seatingPlan["business"].rows;
            if(seatnumber<=businessmax){
                passengerInfo.seattype="business";
            }
            else{
                passengerInfo.seattype="economy";
            }
        }
        const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
        .from('people')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

        if (lastCrewMemberError) {
            throw lastCrewMemberError;
        }

        // Calculate the next available id
        const nextId = lastCrewMember.length > 0 ? lastCrewMember[0].id + 1 : 1;
        // Insert the passenger information into the Supabase table
        passengerInfo.id=nextId;
        const { data: insertedPassengerInfo, error: insertError } = await supabase
            .from('passengers')
            .insert([passengerInfo]);

        if (insertError) {
            throw insertError;
        }
        addedPassengers.push(passengerInfo);

        }
        res.status(201).json({ message: 'Passenger information added successfully', addedPassengers });
        }catch (error) {
            console.error('Error adding passanger information:', error.message);
            res.status(500).json({ error: 'Internal server error' });
          }
        });        

    return router;
}







