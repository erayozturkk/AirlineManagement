const { Pilot } = require('./FlightCrew')

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');


module.exports = function createFlightCrewInfoRouter(supabaseKey) {
    // Initialize Supabase client
    const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
    const supabase = createClient(supabaseUrl, supabaseKey);



     // Utility function to capitalize the first letter of each word
    function capitalizeNames(names) {
      for (let i = 0; i < names.length; i++) {
        if(names[i]){
          names[i] = capitalizeName(names[i])
        }
      }
    }
    function capitalizeName(name) {
        return name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
    function capitalizeInput(input) {
        if (input & typeof input === 'string') {
          return capitalizeName(input);
        } else if (Array.isArray(input)) {
          return capitalizeNames(input);
        } else {
          throw new Error("Input must be a string or an array of strings");
        }
      }



    router.post('/add-crew-member', async (req, res) => {
      try {
        
    
        // Extract parameters from the request query with fallback values
        var {
          name,
          age,
          gender,
          nationality,
          languages,
          seniorityLevel,
          vehiclerestriction,
          allowedRange
        } = req.query;


         // Get aircrafts list
         const { data: aircraftData, error: aircraftError } = await supabase
         .from('aircrafts')
         .select('vehicletype');
         
         if (aircraftError) {
           throw aircraftError;
         }
         const aircrafts = aircraftData.map(aircraft => aircraft.vehicletype);


        const validPilotTypes = ["Senior", "Junior", "Trainee"];
       // Input checks 
        if (seniorityLevel && !validPilotTypes.includes(seniorityLevel)) {
          return res.status(400).json({ error: `Invalid attendanttype provided: ${seniorityLevel}`, validPilotTypes: validPilotTypes });
        }

        if (vehiclerestriction && !aircrafts.includes(vehiclerestriction)) {
          return res.status(400).json({ error: `Invalid vehiclerestriction provided: ${vehiclerestriction}`, validAircrafts: aircrafts });
        }
        if (age && age < 18) {
          return res.status(400).json({ error: 'Age cannot be less than 18', age: age });
          } 


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
        //Convert the strings to capital
        const arr = [name, gender,nationality];
        capitalizeInput(arr)
        name = arr[0];
        gender = arr[1];
        nationality = arr[2];
        if(languages){
          capitalizeInput(languages)
        }
    
        // Create a new random crew member object and set the next available id
        const newCrewMember = Pilot.generateRandom();
        newCrewMember.id = nextId;
        newCrewMember.name = name || newCrewMember.name;
        newCrewMember.age = age || newCrewMember.age;
        newCrewMember.gender = gender || newCrewMember.gender;
        newCrewMember.nationality = nationality || newCrewMember.nationality;
        if (languages !== undefined) newCrewMember.languages= languages;
        newCrewMember.seniorityLevel = seniorityLevel || newCrewMember.seniorityLevel;
        newCrewMember.allowedRange = allowedRange || newCrewMember.allowedRange;
        if (seniorityLevel && !allowedRange) {
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
            let { limit, vehiclerestriction, seniorityLevel } = req.query;
            const { data: aircraftData, error: aircraftError } = await supabase
            .from('aircrafts')
            .select('vehicletype');
            
            if (aircraftError) {
              throw aircraftError;
            }
            const aircrafts = aircraftData.map(aircraft => aircraft.vehicletype);
            const validPilotTypes = ["Senior", "Junior", "Trainee"];

            // Input checks
            if (limit && limit < 1) {
              return res.status(400).json({ error: `Limit cannot be less than 1 limit: ${limit}`   });
            }
            if (seniorityLevel && !validPilotTypes.includes(seniorityLevel)) {
              return res.status(400).json({ error: `Invalid attendanttype provided: ${seniorityLevel}`, validPilotTypes: validPilotTypes });
            }
            if (vehiclerestriction && !aircrafts.includes(vehiclerestriction)) {
              return res.status(400).json({ error: `Invalid vehiclerestriction provided: ${vehiclerestriction}`, validAircrafts: aircrafts });
            }

          
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
                if(seniorityLevel){
                  newCrewMember.seniorityLevel= seniorityLevel;
                }
                if(vehiclerestriction){
                  newCrewMember.vehicleRestriction= vehiclerestriction;
                }
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
    router.get('/get-crew-members-list', async (req, res) => {
      try {
          // Extract the ids parameter from the query string and parse it into an array of integers
          const { ids } = req.query;
          if (!ids) {
              return res.status(400).json({ error: 'No ids provided' });
          }
  
          const idsArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  
          if (idsArray.length === 0) {
              return res.status(400).json({ error: 'Invalid ids provided' });
          }
  
          // Construct the query
          let query = supabase.from('flight_crew').select('*').in('id', idsArray);
  
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

        const { data: aircraftData, error: aircraftError } = await supabase
            .from('aircrafts')
            .select('vehicletype');
            
            if (aircraftError) {
              throw aircraftError;
            }
            const aircrafts = aircraftData.map(aircraft => aircraft.vehicletype);
            const validPilotTypes = ["Senior", "Junior", "Trainee"];

            // Input checks
            if (limit && limit < 1) {
              return res.status(400).json({ error: `Limit cannot be less than 1 limit: ${limit}`   });
            }
            if (seniorityLevel && !validPilotTypes.includes(seniorityLevel)) {
              return res.status(400).json({ error: `Invalid attendanttype provided: ${seniorityLevel}`, validPilotTypes: validPilotTypes });
            }
            if (vehicleRestriction && !aircrafts.includes(vehicleRestriction)) {
              return res.status(400).json({ error: `Invalid vehiclerestriction provided: ${vehicleRestriction}`, validAircrafts: aircrafts });
            }
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
    
    return router;
}