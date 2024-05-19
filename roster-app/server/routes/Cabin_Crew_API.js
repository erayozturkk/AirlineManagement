
const { CabinCrew, commonLanguages, recipes, aircrafts } = require('./CabinCrew')

const express = require('express');
const router = express.Router();
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
      newCrewMember.setAttendantid(nextId);

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
        const { attendanttype, vehiclerestriction, limit } = req.query;
        // Convert the limit parameter to a number
        const limitNumber = limit ? parseInt(limit) : undefined;
    
        // Fetch crew members from Supabase
        let { data: crewMembers, error } = await supabase
          .from('cabin_crew')
          .select('*')
          .order('id', { ascending: true }); 
    
        // Handle any error fetching crew members
        if (error) {
          throw error;
        }
    
        // Filter crew members based on parameters
        if (attendanttype) {
          crewMembers = crewMembers.filter(member => member.attendanttype === attendanttype);
        }
        if (vehiclerestriction) {
          crewMembers = crewMembers.filter(member => member.vehiclerestriction.includes(vehiclerestriction));
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
};
