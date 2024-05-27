
const { CabinCrew, commonLanguages, recipes } = require('./CabinCrew')

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');




module.exports = function createCabinCrewInfoRouter(supabaseKey) {
  // Initialize Supabase client
  const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
  const supabase = createClient(supabaseUrl, supabaseKey);




  // Utility function to capitalize the first letter of each word
  function capitalizeNames(names) {
    for (let i = 0; i < names.length; i++) {
      if (names[i]) {
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

  // POST route to add a new crew member
  router.post('/add-crew-member', async (req, res) => {
    try {
      // Extract parameters from the request query
      let { name, age, gender, nationality, languages, attendanttype, vehiclerestriction } = req.query;

      // Get aircrafts list
      const { data: aircraftData, error: aircraftError } = await supabase
        .from('aircrafts')
        .select('vehicletype');

      if (aircraftError) {
        throw aircraftError;
      }
      const aircrafts = aircraftData.map(aircraft => aircraft.vehicletype);

      const validAttendantTypes = ["chief", "regular", "chef"];
      // Input checks 
      if (attendanttype && !validAttendantTypes.includes(attendanttype)) {
        return res.status(400).json({ error: `Invalid attendanttype provided: ${attendanttype}`, validAttendantTypes: validAttendantTypes });
      }
      if (vehiclerestriction) {
        if (!Array.isArray(vehiclerestriction)) {
          return res.status(400).json({ error: 'vehiclerestriction must be an array' });
        }
        for (const restriction of vehiclerestriction) {
          if (!aircrafts.includes(restriction)) {
            return res.status(400).json({ error: `Invalid vehiclerestriction provided: ${restriction}`, validAircrafts: aircrafts });
          }
        }
      }
      if (age && ((age < 18) || isNaN(age))) {
        return res.status(400).json({ error: 'Age must be an integer less than 18', age: age });
      }
      const arr = [name, gender, nationality];
      capitalizeInput(arr)
      name = arr[0];
      gender = arr[1];
      nationality = arr[2];
      if (languages) {
        capitalizeInput(languages)
      }


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

      // Get the queried inputs
      let { limit, vehiclerestriction, attendanttype } = req.query;
      // Get aircrafts
      const { data: aircraftData, error: aircraftError } = await supabase
        .from('aircrafts')
        .select('vehicletype');

      if (aircraftError) {
        throw aircraftError;
      }
      const aircrafts = aircraftData.map(aircraft => aircraft.vehicletype);
      const validAttendantTypes = ["chief", "regular", "chef"];

      // Input checks
      if (limit && (isNaN(limit) || limit < 1)) {
        return res.status(400).json({ error: `Limit should be a positive integer limit: ${limit}` });
      }
      if (attendanttype && !validAttendantTypes.includes(attendanttype)) {
        return res.status(400).json({ error: `Invalid attendanttype provided: ${attendanttype}`, validAttendantTypes: validAttendantTypes });
      }
      if (vehiclerestriction) {
        if (!Array.isArray(vehiclerestriction)) {
          return res.status(400).json({ error: 'vehiclerestriction must be an array' });
        }
        for (const restriction of vehiclerestriction) {
          if (!aircrafts.includes(restriction)) {
            return res.status(400).json({ error: `Invalid vehiclerestriction provided: ${restriction}`, validAircrafts: aircrafts });
          }
        }
      }


      // Set default value for limit if not specified
      if (!limit || isNaN(limit)) {
        limit = 10;
      }

      const limitNumber = parseInt(limit);
      // Get last id 
      const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
        .from('people')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (lastCrewMemberError) {
        throw lastCrewMemberError;
      }

      // Calculate the next available id
      let uId;
      if (lastCrewMember && lastCrewMember.length > 0) {
        uId = lastCrewMember[0].id + 1;
      } else {
        uId = 1;
      }

      // Create an array to store the new crew members
      const newCrewMembers = [];

      // Generate random pilots based on the limit
      for (let i = 0; i < limitNumber; i++) {
        const newCrewMember = CabinCrew.generateRandom();
        newCrewMember.id = uId + i; // Increment the id for each new cabin crew member
        if (vehiclerestriction) {
          newCrewMember.setVehiclerestriction(vehiclerestriction);
        }
        if (attendanttype) {
          newCrewMember.setAttendanttype(attendanttype)
        }
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

      if (limit && (isNaN(limit) || limit < 1)) {
        return res.status(400).json({ error: `Limit should be a positive integer limit: ${limit}` });
      }

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
      let query = supabase.from('cabin_crew').select('*').in('id', idsArray);

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
      let { id, name, gender, nationality, attendanttype, vehiclerestriction, limit } = req.query;
      // Get aircrafts
      const { data: aircraftData, error: aircraftError } = await supabase
        .from('aircrafts')
        .select('vehicletype');

      if (aircraftError) {
        throw aircraftError;
      }

      const aircrafts = aircraftData.map(aircraft => aircraft.vehicletype);
      const validAttendantTypes = ["chief", "regular", "chef"];
      // Input checks
      if (id && isNaN(id)) {
        return res.status(400).json({ error: `id should be an integer id: ${id}` });
      }
      if (limit && (isNaN(limit) || limit < 1)) {
        return res.status(400).json({ error: `Limit should be a positive integer limit: ${limit}` });
      }
      if (attendanttype && !validAttendantTypes.includes(attendanttype)) {
        return res.status(400).json({ error: `Invalid attendanttype provided: ${attendanttype}`, validAttendantTypes: validAttendantTypes });
      }
      if (vehiclerestriction) {
        if (!Array.isArray(vehiclerestriction)) {
          return res.status(400).json({ error: 'vehiclerestriction must be an array' });
        }
        for (const restriction of vehiclerestriction) {
          if (!aircrafts.includes(restriction)) {
            return res.status(400).json({ error: `Invalid vehiclerestriction provided: ${restriction}`, validAircrafts: aircrafts });
          }
        }
      }

      //Convert strings to first letter upper
      const arr = [name, gender, nationality];
      capitalizeInput(arr)
      name = arr[0];
      gender = arr[1];
      nationality = arr[2];

      const limitNumber = limit ? parseInt(limit) : undefined;
      const idNumber = id ? parseInt(id) : undefined;

      // Construct the query
      let query = supabase.from('cabin_crew').select('*').order('id', { ascending: true });

      const queryParams = { id: idNumber, name, gender, nationality, attendanttype, vehiclerestriction };

      // Build the query dynamically
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key]) {
          if (key === 'vehiclerestriction') {
            query = query.contains(key, [queryParams[key]]);
          } else {
            query = query.eq(key, queryParams[key]);
          }
        }
      });

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
};