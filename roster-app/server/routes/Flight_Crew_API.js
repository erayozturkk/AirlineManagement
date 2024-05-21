const { Pilot } = require('./FlightCrew')

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');


module.exports = function createFlightCrewInfoRouter(supabaseKey) {
    // Initialize Supabase client
    const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
    const supabase = createClient(supabaseUrl, supabaseKey);



    router.post('/add-crew-member', async (req, res) => {
      try {
        // Get the last id from the database
        const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
          .from('people')
          .select('id')
          .order('id', { ascending: false })
          .limit(1)
          .single();
      
        if (lastCrewMemberError) {
          throw lastCrewMemberError;
        }
    
        // Calculate the next available id
        const nextId = lastCrewMember ? lastCrewMember.id + 1 : 1;
    
        // Extract parameters from the request query with fallback values
        const {
          name = '',
          age = 0,
          gender = '',
          nationality = '',
          languages = [],
          seniorityLevel = '',
          vehiclerestriction = ''
        } = req.query;
    
        // Create a new random crew member object and set the next available id
        const newCrewMember = Pilot.generateRandom();
        newCrewMember.id = nextId;
        newCrewMember.name = name || newCrewMember.name;
        newCrewMember.age = age || newCrewMember.age;
        newCrewMember.gender = gender || newCrewMember.gender;
        newCrewMember.nationality = nationality || newCrewMember.nationality;
        newCrewMember.languages = languages.length ? languages : newCrewMember.languages;
        newCrewMember.seniorityLevel = seniorityLevel || newCrewMember.seniorityLevel;
        if (seniorityLevel) {
          newCrewMember.allowedRange = newCrewMember.calculateMaxAllowedRange();
        }
        newCrewMember.vehicleRestriction = vehiclerestriction || newCrewMember.vehicleRestriction;
    
        // Insert the crew member into the Supabase table
        const { data: insertedCrewMember, error: insertError } = await supabase
          .from('flight_crew')
          .insert(newCrewMember)
          .single();
    
        if (insertError) {
          throw insertError;
        }
    
        res.status(201).json({ message: 'Crew member added successfully', crewMember: newCrewMember });
      } catch (error) {
        console.error('Error adding crew member:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    

    router.post('/add-many-crew-member', async (req, res) => {
        try {
            let { limit } = req.query;
    
            // Set default value for limit if not specified
            if (!limit || isNaN(limit)) {
                limit = 10;
            }
    
            const limitNumber = parseInt(limit);
    
            const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
              .from('people')
              .select('id')
              .order('id', { ascending: false })
              .limit(1);

            if (lastCrewMemberError) {
              throw lastCrewMemberError;
            }
            // Calculate the next available id
            const nextId = lastCrewMember ? lastCrewMember[0].id + 1 : 1;
    
            // Create an array to store the new crew members
            const newCrewMembers = [];
    
            // Generate random pilots based on the limit
            for (let i = 0; i < limitNumber; i++) {
                const newCrewMember = Pilot.generateRandom();
                newCrewMember.id = nextId + i; // Increment the id for each new pilot
                newCrewMembers.push(newCrewMember);
            }
    
            // Insert the crew members into the Supabase table
            const { data: insertedCrewMembers, error: insertError } = await supabase
                .from('flight_crew')
                .insert(newCrewMembers);
    
            if (insertError) {
                throw insertError;
            }
    
            res.status(201).json({ message: 'Crew members added successfully', crewMembers: newCrewMembers });
        } catch (error) {
            console.error('Error adding crew members:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // GET route to get a specified number of crew members sorted by attendantid
    router.get('/get-crew-members', async (req, res) => {
      try {
        // Extract the limit parameter from the query string
        const { limit } = req.query;
        const limitNumber = limit ? parseInt(limit) : 10; // Default limit is 10 if not provided
    
        // Construct the query
        let query = supabase.from('flight_crew').select('*').order('id', { ascending: true }).limit(limitNumber);
    
        // Execute the query
        const { data: crewMembers, error } = await query;
    
        // Handle any error fetching crew members
        if (error) {
          throw error;
        }
    
        // Send response with crew members
        res.json(crewMembers);
      } catch (error) {
        console.error('Supabase connection error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    

    router.get('/find-crew-members', async (req, res) => {
      try {
        // Extract parameters from the query string
        const { id, seniorityLevel, vehicleRestriction, allowedRange, limit } = req.query;
        const limitNumber = limit ? parseInt(limit) : undefined;
        const idNumber = id ? parseInt(id) : undefined;
    
        // Construct the query to fetch all matching records
        let query = supabase.from('flight_crew').select('*').order('id', { ascending: true });
    
        // Apply filters based on query parameters
        if (idNumber) {
          query = query.eq('id', idNumber);
        } else {
          if (allowedRange) {
            query = query.gt('allowedRange', allowedRange);
          }
          if (seniorityLevel) {
            query = query.eq('seniorityLevel', seniorityLevel);
          }
          if (vehicleRestriction) {
            query = query.eq('vehicleRestriction', vehicleRestriction);
          }
        }
    
        // Execute the query
        const { data: crewMembers, error } = await query;
    
        // Handle any error fetching crew members
        if (error) {
          throw error;
        }
    
        // If limit is specified, select a random subset of the results
        if (limitNumber && crewMembers.length > limitNumber) {
          const shuffled = crewMembers.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, limitNumber);
          res.json(selected);
        } else {
          res.json(crewMembers);
        }
      } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    

    

    router.get('/combined-crew-members', async (req, res) => {
      try {
        const { vehicleRestriction: vehicleRestriction, allowedRange } = req.query;

        const randomValue = Math.floor(Math.random() * 3);
        const params1 = { seniorityLevel: "Senior", vehicleRestriction, allowedRange, limit: 1 };
        const params2 = { seniorityLevel: "Junior", vehicleRestriction, allowedRange, limit: 1 };
        const params3 = { seniorityLevel: "Trainee", vehicleRestriction, allowedRange, limit: randomValue };

        const baseURL = 'http://localhost:5001/flight-crew/find-crew-members';

        // Call /find-crew-members three times with different parameters
        const [response1, response2, response3] = await Promise.all([
          axios.get(baseURL, { params: params1 }),
          axios.get(baseURL, { params: params2 }),
          axios.get(baseURL, { params: params3 })
        ]);

        const combinedCrewMembers = [
          ...response1.data,
          ...response2.data,
          ...response3.data
        ];

        res.json(combinedCrewMembers);
      } catch (error) {
        console.error('Error combining crew members:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
    });


    
    
    

    return router;
}