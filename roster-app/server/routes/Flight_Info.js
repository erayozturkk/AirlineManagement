const { createClient } = require('@supabase/supabase-js');
const express = require('express');

// Create a new router instance
const router = express.Router();

// Function to create the flight info router
module.exports = function createFlightInfoRouter(supabaseKey) {
    // Initialize Supabase client
    const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Endpoint to get flight information by flight number
    router.get('/find_flight_information', async (req, res) => {
        try {
            const {
                flight_num,
                date,
                origin_country,
                origin_city,
                origin_airport_name,
                origin_airport_code,
                destination_country,
                destination_city,
                vehicle_type,
                destination_airport_name,
                destination_airport_code,
                shared_flight_number,
                shared_flight_company
            } = req.query;
    
            let query = supabase.from('flight_info').select('*');
    
            if (flight_num) {
                query = query.eq('flight_num', flight_num);
            }
    
            if (date) {
                query = query.eq('date', date);
            }
    
            if (origin_country) {
                query = query.eq('origin_country', origin_country);
            }
    
            if (origin_city) {
                query = query.eq('origin_city', origin_city);
            }
    
            if (origin_airport_name) {
                query = query.eq('origin_airport_name', origin_airport_name);
            }
    
            if (origin_airport_code) {
                query = query.eq('origin_airport_code', origin_airport_code);
            }
    
            if (destination_country) {
                query = query.eq('destination_country', destination_country);
            }
    
            if (destination_city) {
                query = query.eq('destination_city', destination_city);
            }
    
            if (vehicle_type) {
                query = query.eq('vehicle_type', vehicle_type);
            }
    
            if (destination_airport_name) {
                query = query.eq('destination_airport_name', destination_airport_name);
            }
    
            if (destination_airport_code) {
                query = query.eq('destination_airport_code', destination_airport_code);
            }
    
            if (shared_flight_number) {
                query = query.eq('shared_flight_number', shared_flight_number);
            }
    
            if (shared_flight_company) {
                query = query.eq('shared_flight_company', shared_flight_company);
            }
    
            const { data, error } = await query;
    
            if (error) {
                throw error;
            }
    
            res.json(data);
        } catch (error) {
            console.error('Error fetching flight information:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    return router;
};
