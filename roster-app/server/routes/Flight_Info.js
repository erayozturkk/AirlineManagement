// Flight_Info.js

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Define API routes related to flight information

module.exports = function createFlightInfoRouter(supabaseKey) {
  // Initialize Supabase client
  const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Endpoint to get flight information by flight number
  router.get('/:flightNumber', async (req, res) => {
    try {
      const flightNumber = req.params.flightNumber;
      // Query Supabase to get flight information by flight number
      const { data, error } = await supabase
        .from('flight_info')
        .select('*')
        .eq('flight_num', flightNumber)
        .single();

      if (error) {
        console.error('Error querying Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (!data) {
          res.status(404).json({ error: 'Flight not found' });
        } else {
          res.json({ flightInfo: data });
        }
      }
    } catch (error) {
      console.error('Error processing request:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Endpoint to get shared flight information by flight number
  router.get('/shared/:flightNumber', async (req, res) => {
    try {
      const flightNumber = req.params.flightNumber;
      // Query Supabase to get shared flight information by flight number
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('shared_flight_number', flightNumber)
        .single();

      if (error) {
        console.error('Error querying Supabase:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        if (!data) {
          res.status(404).json({ error: 'Shared flight not found' });
        } else {
          res.json({ sharedFlightInfo: data });
        }
      }
    } catch (error) {
      console.error('Error processing request:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
