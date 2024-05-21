const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const FlightInfoRouter = require('./Flight_Info');
const CabinCrewRouter = require('./Cabin_Crew_API');
const FlightCrewRouter = require('./Flight_Crew_API');
const PassengerCrewRouter = require('./Passenger_Info_API');

module.exports = function createMainSystemRouter(supabaseKey) {
  // Initialize Supabase client
  const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const cabinCrewRouter = CabinCrewRouter(supabaseKey);
  router.use('/cabin-crew', cabinCrewRouter);

  const flightInfoRouter = FlightInfoRouter(supabaseKey);
  router.use('/flight-info', flightInfoRouter);

  const flightCrewRouter = FlightCrewRouter(supabaseKey);
  router.use('/flight-crew', flightCrewRouter);

  const passengerInfoRouter = PassengerCrewRouter(supabaseKey);
  router.use('/passenger-info', passengerInfoRouter);

  router.get('/get-flight-roster', async (req, res) => {
    try {
      const { flight_num } = req.query; // Use query parameters for GET requests
  
      // Fetch flight information
      const flightInfoResponse = await axios.get('http://localhost:5001/flight-info/find_flight_information', {
        params: { flight_num },
        headers: { 'Content-Type': 'application/json' }
      });
  
      const flightInfo = flightInfoResponse.data;
      const vtype = flightInfo['vehicle_type'];
      const range = flightInfo['distance'];
  
      // Fetch flight crew information
      const flightCrewResponse = await axios.get('http://localhost:5001/flight-crew/combined-crew-members', {
        params: { vehicleRestriction: vtype, allowedRange: range },
        headers: { 'Content-Type': 'application/json' }
      });
      const flightCrew = flightCrewResponse.data;
  
      // Fetch cabin crew information
      const cabinCrewResponse = await axios.get('http://localhost:5001/cabin-crew/combined-crew-members', {
        params: { vehiclerestriction: vtype },
        headers: { 'Content-Type': 'application/json' }
      });
      const cabinCrew = cabinCrewResponse.data;
  
      // Fetch passengers information
      const passengersResponse = await axios.get('http://localhost:5001/passenger-info/get-passengers', {
        params: { flight_num },
        headers: { 'Content-Type': 'application/json' }
      });
      const passengers = passengersResponse.data;
  
      // Combine all data into a single response
      const flightRoster = { flightInfo, flightCrew, cabinCrew, passengers };
      res.json(flightRoster);
    } catch (error) {
      console.error('Error fetching flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

  return router;
};
