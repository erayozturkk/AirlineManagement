
const { CabinCrew, commonLanguages, recipes, aircrafts } = require('./CabinCrew')

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');




module.exports = function createCabinCrewInfoRouter(supabaseKey) {
  // Initialize Supabase client
  const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // POST route to add a new crew member
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
      const { name, age, gender, nationality, languages, attendanttype, vehiclerestriction } = req.query;

      // Create a new random crew member object and set the next available id
      const newCrewMember = CabinCrew.generateRandom();
      newCrewMember.setid(nextId);

      // Check and set each parameter on the newCrewMember object
      if (name !== undefined) newCrewMember.setName(name);
      if (age !== undefined) newCrewMember.setAge(age);
      if (gender !== undefined) newCrewMember.setGender(gender);
      if (nationality !== undefined) newCrewMember.setNationality(nationality);
      if (languages !== undefined) newCrewMember.setLanguages(languages);
      if (attendanttype !== undefined) newCrewMember.setAttendanttype(attendanttype);
      if (vehiclerestriction !== undefined) newCrewMember.setVehiclerestriction(vehiclerestriction);

      // Insert the crew member into the Supabase table
      const { data: insertedCrewMember, error: insertError } = await supabase
        .from('cabin_crew')
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
            const newCrewMember = CabinCrew.generateRandom();
            newCrewMember.id = nextId + i; // Increment the id for each new cabin crew member
            newCrewMembers.push(newCrewMember);
        }

        // Insert the crew members into the Supabase table
        const { data: insertedCrewMembers, error: insertError } = await supabase
            .from('cabin_crew')
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

  
    
    
    // GET route to get a specified number of crew members sorted by id
    router.get('/get-crew-members', async (req, res) => {
      try {
        // Extract the limit parameter from the query string
        const { limit } = req.query;
        
        // Convert the limit parameter to a number
        const limitNumber = limit ? parseInt(limit) : 10; // Default limit is 10 if not provided
    
        // Fetch the list of crew members from Supabase with sorting by attendant id and the specified limit
        const { data, error } = await supabase
          .from('cabin_crew')
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
        const { id, attendanttype, vehiclerestriction, limit } = req.query;
        const limitNumber = limit ? parseInt(limit) : undefined;
        const idNumber = id ? parseInt(id) : undefined;
        
    
        // Construct the query
        let query = supabase.from('cabin_crew').select('*').order('id', { ascending: true });
    
        if (idNumber) {
          query = query.eq('id', idNumber);
        } else {
          if (attendanttype) {
            query = query.eq('attendanttype', attendanttype);
          }
          if (vehiclerestriction) {
            query = query.contains('vehiclerestriction', [vehiclerestriction]);
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
        const {  vehiclerestriction: vehicleRestriction} = req.query;
    
        const randomValue = Math.floor(Math.random() * 3);
        const randomValue1to4 = Math.floor(Math.random() * 4) + 1;
        const randomValue4to16 = Math.floor(Math.random() * 13) + 4
        const params1 = { attendanttype: "chief", vehicleRestriction, limit: randomValue1to4 };
        const params2 = { attendanttype: "regular", vehicleRestriction, limit: randomValue4to16 };
        const params3 = { attendanttype: "chef", vehicleRestriction, limit: randomValue };
    
        const baseURL = 'http://localhost:5001/cabin-crew/find-crew-members';
    
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
        console.error('Error combining cabin crew members:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    
    
  return router;
};
