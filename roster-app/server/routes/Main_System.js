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

  router.post('/generate-flight-roster', async (req, res) => {
    try {
      const { flight_num } = req.query; // Use query parameters for GET requests

        // Check if a roster for the given flight_num already exists
      let query = supabase.from('flightrosters').select('*').eq('flightnum', flight_num).single();

      const { data: existingRoster, error: existingRosterError } = await query;

      if (existingRosterError && existingRosterError.code !== 'PGRST116') {
        // Handle any other errors except "No rows found" error
        throw existingRosterError;
      }

      if (existingRoster) {
        // If a roster already exists, throw an error
        return res.status(400).json({ error: 'A flight roster for this flight number already exists.' });
      }

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
      const flightCrewids = flightCrewResponse.data;
  
      // Fetch cabin crew information
      const cabinCrewResponse = await axios.get('http://localhost:5001/cabin-crew/combined-crew-members', {
        params: { vehiclerestriction: vtype },
        headers: { 'Content-Type': 'application/json' }
      });
      const cabinCrewids = cabinCrewResponse.data;
  
      // Fetch passengers information
      const passengersResponse = await axios.get('http://localhost:5001/passenger-info/get-passengers', {
        params: { flightnum: flight_num },
        headers: { 'Content-Type': 'application/json' }
      });
      const passengers = passengersResponse.data;
      const passengerids = passengersResponse.data.map(passenger => passenger.id);
      
      for(let i= 0;i<passengers.length;i++){
        let passenger = passengers[i];
        if(!passenger.seatnumber){
          if(passenger.affiliated_passenger){
            
          }
        }
      }

       // Fetch the last roster_id
       const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
       .from('flightrosters')
       .select('rosterid')
       .order('rosterid', { ascending: false })
       .limit(1);

        if (lastCrewMemberError) {
          throw lastCrewMemberError;
        }
        // Calculate the next available id
        let nextId;
      if (lastCrewMember && lastCrewMember.length > 0) {
        nextId = lastCrewMember[0].id + 1;
      } else {
        nextId = 1;
      }

      // Insert the new flight roster data
        const { error: insertError } = await supabase
        .from('flightrosters')
        .insert([
          {
            rosterid: nextId,
            flightnum: flight_num,
            pilotids: flightCrewids,
            cabincrewrids: cabinCrewids,
            passengerids: passengerids
          }
        ]);

      if (insertError) {
        throw insertError;
      }
      // Combine all data into a single response
      res.json({ message: 'Flight roster generated and saved successfully', roster_id: nextId });
    } catch (error) {
      console.error('Error generating flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  router.get('/get-tabular-view', async (req, res) => {
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
  
      // Fetch pilotids
      const { data: pilotData, error: pilotError } = await supabase
        .from('flightrosters')
        .select('pilotids')
        .eq('flightnum', flight_num);
  
      if (pilotError) {
        console.error('Error fetching pilotids:', pilotError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const pilotIds = pilotData.length > 0 ? pilotData[0].pilotids : [];
  
      // Fetch cabincrewrids
      const { data: cabinCrewData, error: cabinCrewError } = await supabase
        .from('flightrosters')
        .select('cabincrewrids')
        .eq('flightnum', flight_num);
  
      if (cabinCrewError) {
        console.error('Error fetching cabincrewrids:', cabinCrewError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const cabinCrewIds = cabinCrewData.length > 0 ? cabinCrewData[0].cabincrewrids : [];
  
      // Fetch pilot details from the defined endpoint
      const pilotDetailsResponse = await axios.get('http://localhost:5001/flight-crew/get-crew-members-list', {
        params: { ids: pilotIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const pilots = pilotDetailsResponse.data.map(pilot => ({
        id: pilot.id,
        name: pilot.name,
        peopletype: `${pilot.seniorityLevel} Pilot`
      }));

  
      // Fetch cabin crew details from the defined endpoint
      const cabinCrewDetailsResponse = await axios.get('http://localhost:5001/cabin-crew/get-crew-members-list', {
        params: { ids: cabinCrewIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const cabinCrew = cabinCrewDetailsResponse.data.map(crew => ({
        id: crew.id,
        name: crew.name,
        peopletype: crew.attendanttype === 'chef' ? 'Chef' : `${crew.attendanttype} Crew`
      }));

  
      // Fetch passenger details from the defined endpoint
      const passengersResponse = await axios.get('http://localhost:5001/passenger-info/get-passengers', {
        params: { flight_num },
        headers: { 'Content-Type': 'application/json' }
      });
      const passengers = passengersResponse.data.map(passenger => ({
        id: passenger.id,
        name: passenger.name,
        peopletype: 'passenger'
      }));
  
      // Combine all data and sort by name
      // Sort each array individually
      const sortedPilots = pilots.sort((a, b) => a.name.localeCompare(b.name));
      const sortedCabinCrew = cabinCrew.sort((a, b) => a.name.localeCompare(b.name));
      const sortedPassengers = passengers.sort((a, b) => a.name.localeCompare(b.name));

      // Combine the sorted arrays
      const combinedRoster = [...sortedPilots, ...sortedCabinCrew, ...sortedPassengers];

  
      // Send the response
      res.json(combinedRoster);
  
    } catch (error) {
      console.error('Error fetching flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/get-extended-view', async (req, res) => {
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
  
      // Fetch pilotids
      const { data: pilotData, error: pilotError } = await supabase
        .from('flightrosters')
        .select('pilotids')
        .eq('flightnum', flight_num);
  
      if (pilotError) {
        console.error('Error fetching pilotids:', pilotError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const pilotIds = pilotData.length > 0 ? pilotData[0].pilotids : [];
  
      // Fetch cabincrewrids
      const { data: cabinCrewData, error: cabinCrewError } = await supabase
        .from('flightrosters')
        .select('cabincrewrids')
        .eq('flightnum', flight_num);
  
      if (cabinCrewError) {
        console.error('Error fetching cabincrewrids:', cabinCrewError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const cabinCrewIds = cabinCrewData.length > 0 ? cabinCrewData[0].cabincrewrids : [];

  
      // Fetch pilot details from the defined endpoint
      const pilotDetailsResponse = await axios.get('http://localhost:5001/flight-crew/get-crew-members-list', {
        params: { ids: pilotIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const pilots = pilotDetailsResponse.data;
  
      // Fetch cabin crew details from the defined endpoint
      const cabinCrewDetailsResponse = await axios.get('http://localhost:5001/cabin-crew/get-crew-members-list', {
        params: { ids: cabinCrewIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const cabinCrew = cabinCrewDetailsResponse.data;

      const passengersResponse = await axios.get('http://localhost:5001/passenger-info/get-passengers', {
        params: { flight_num },
        headers: { 'Content-Type': 'application/json' }
      });
      const passengers = passengersResponse.data;
  
      // Combine all data
      const flightRoster = {
        pilots,
        cabinCrew,
        passengers
      };
  
      res.json(flightRoster);
  
    } catch (error) {
      console.error('Error fetching flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

  return router;
};
