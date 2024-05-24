const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const router = express.Router();

router.get('/aircraft_info', async (req, res) => {
    try {
        const { vehicle_type } = req.query; // Use req.query for query parameters
        let query = supabase.from('aircrafts').select('*');
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
