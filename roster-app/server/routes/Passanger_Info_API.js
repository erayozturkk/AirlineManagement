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

            if (passengerid) {
                query = query.eq('passengerid', passengerid);
            }
            if (flightnum) {
                query = query.eq('flightnum', flightnum);
            }
            if (name) {
                query = query.eq('name', name);
            }
            if (age) {
                query = query.eq('age', age);
            }
            if (gender) {
                query = query.eq('gender', gender);
            }
            if (nationality) {
                query = query.eq('nationality', nationality);
            }
            if (seattype) {
                query = query.eq('seattype', seattype);
            }
            if (seatnumber) {
                query = query.eq('seatnumber', seatnumber);
            }
            if (parentid) {
                query = query.eq('parentid', parentid);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            res.json(data);
        } catch (error) {
            console.error('Supabase connection error:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}







