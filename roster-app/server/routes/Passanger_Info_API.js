const { createClient } = require('@supabase/supabase-js');
const express = require('express');

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
    router.post('/add-passanger-info', async (req, res) => {
        try {
            const {
                flightnum,
                name,
                age,
                gender,
                nationality,
                seattype,
                seatnumber,
                parentid
            } = req.query;
          
        let limitNumber;
        if(limit){
          limitNumber=parseInt(limit);
        }
        else{
          limitNumber=5;
        }
        const addedFlights = [];
          for (let i = 0; i < limitNumber; i++) {
            


          }

        }catch (error) {
            console.error('Error adding flight information:', error.message);
            res.status(500).json({ error: 'Internal server error' });
          }
        });        

        function generateRandom() {
            const name = faker.name.findName();
            const age = faker.datatype.number({ min: 18, max: 60 });
            const gender = faker.random.arrayElement(["Male", "Female"]);
            const nationality = faker.address.country();
        }
    return router;
}







