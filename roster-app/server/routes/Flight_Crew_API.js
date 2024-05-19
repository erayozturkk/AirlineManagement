const { Pilot } = require('./FlightCrew')

const express = require('express');
const router = express.Router();
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
            .limit(1);
  
        if (lastCrewMemberError) {
          throw lastCrewMemberError;
        }
  
        // Calculate the next available id
        const nextId = lastCrewMember.length > 0 ? lastCrewMember[0].id + 1 : 1;
          
          // Extract parameters from the request query
          const { name, age, gender, nationality, languages, seniorityLevel, vehiclerestriction} = req.query;
          // Create a new random crew member object the set the next available id
          const newCrewMember = Pilot.generateRandom();
          newCrewMember.id=nextId; 
          // Check and set each parameter on the newCrewMember object
          if (name !== undefined) {
            newCrewMember.name=name;
          }
      
          if (age !== undefined) {
            newCrewMember.age=age;
          }
      
          if (gender !== undefined) {
            newCrewMember.gender=gender;
          }
      
          if (nationality !== undefined) {
            newCrewMember.nationality=nationality;
          }
      
          if (languages !== undefined) {
            newCrewMember.languages=languages;
          }
      
          if (seniorityLevel !== undefined) {
            newCrewMember.seniorityLevel=seniorityLevel;
            newCrewMember.allowedRange = newCrewMember.calculateMaxAllowedRange();
          }
      
          if (vehiclerestriction !== undefined) {  
            newCrewMember.vehicleRestriction=vehiclerestriction;
          }

      
          // Insert the crew member into the Supabase table
          const { data: insertedCrewMember, error: insertError } = await supabase
            .from('flight_crew')
            .insert(newCrewMember);
      
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
                newCrewMember.pilotId = nextId + i; // Increment the id for each new pilot
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
          
          // Convert the limit parameter to a number
          const limitNumber = limit ? parseInt(limit) : 10; // Default limit is 10 if not provided
      
          // Fetch the list of crew members from Supabase with sorting by attendant id and the specified limit
          const { data, error } = await supabase
            .from('flight_crew')
            .select('*')
            .order('id', { ascending: true }) // Sort by attendant id in ascending order
            .limit(limitNumber);
      
          if (error) {
            throw error;
          }
      
          res.json({ message: 'Supabase connected successfully', crewMembers: data });
        } catch (error) {
          console.error('Supabase connection error:', error.message);
          res.status(500).json({ error: 'Internal server error' });
        }
      });

      router.get('/find-crew-members', async (req, res) => {
        try {
          // Extract parameters from the query string
          const { seniorityLevel, vehicleRestriction, limit } = req.query;
          // Convert the limit parameter to a number
          const limitNumber = limit ? parseInt(limit) : undefined;
      
          // Fetch crew members from Supabase
          let { data: crewMembers, error } = await supabase
            .from('flight_crew')
            .select('*')
            .order('id', { ascending: true }); 
      
          // Handle any error fetching crew members
          if (error) {
            throw error;
          }
      
          // Filter crew members based on parameters
          if (seniorityLevel) {
            crewMembers = crewMembers.filter(member => member.seniorityLevel === seniorityLevel);
          }
          if (vehicleRestriction) {
            crewMembers = crewMembers.filter(member => member.vehicleRestriction === vehiclerestRiction);
          }
      
          // Limit the number of crew members returned if specified
          if (limitNumber) {
            crewMembers = crewMembers.slice(0, limitNumber);
          }
      
          // Send response with filtered crew members
          res.json(crewMembers);
        } catch (error) {
          console.error('Error processing request:', error.message);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    
    

    return router;
}