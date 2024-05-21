const { createClient } = require('@supabase/supabase-js');
const express = require('express');

// Create a new router instance
const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.get('/aircraft_info/:vehicle_type', async (req, res) => {
    try {
        const { vehicle_type } = req.params;
        const decoded_vehicle_type = decodeURIComponent(vehicle_type);
        let query = supabase.from('aircrafts').select('*');
        console.log('Vehicle Type:', decoded_vehicle_type);
        if (vehicle_type) {
            query = query.eq('vehicletype', vehicle_type);
        }
        const { data, error } = await query;
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        console.error('Error fetching aircraft information:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
