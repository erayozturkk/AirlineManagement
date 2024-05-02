require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaXhhamZncGFtYW5icXZ4eXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwNDI5NTYsImV4cCI6MjAyNjYxODk1Nn0.22DwSKkVdZYNPGqruamm-IQ5iQRnlnU3tF73GbwXP7E";
const supabase = createClient(supabaseUrl, supabaseKey);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
const { CabinCrew, commonLanguages, recipes, aircrafts } = require('./CabinCrew')

// POST route to add a new crew member
app.post('/add-crew-member', async (req, res) => {
  try {
    // Get the last ID from the database
    const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
      .from('cabincrewmembers')
      .select('attendantid')
      .order('attendantid', { ascending: false })
      .limit(1);

    if (lastCrewMemberError) {
      throw lastCrewMemberError;
    }

    // Calculate the next available ID
    const nextId = lastCrewMember ? lastCrewMember[0].attendantid + 1 : 1;
    
    // Extract parameters from the request query
    const { name, age, gender, nationality, languages, attendanttype, vehiclerestriction} = req.query;
    // Create a new random crew member object the set the next available ID
    const newCrewMember = CabinCrew.generateRandom();
    newCrewMember.setAttendantid(nextId); 
    // Check and set each parameter on the newCrewMember object
    if (name !== undefined) {
      newCrewMember.setName(name);
    }

    if (age !== undefined) {
      newCrewMember.setAge(age);
    }

    if (gender !== undefined) {
      newCrewMember.setGender(gender);
    }

    if (nationality !== undefined) {
      newCrewMember.setNationality(nationality);
    }

    if (languages !== undefined) {
      // Assuming languages is an array
      newCrewMember.setLanguages(languages);
    }

    if (attendanttype !== undefined) {
      newCrewMember.setAttendanttype(attendanttype);
    }

    if (vehiclerestriction !== undefined) {
      // Assuming vehiclerestriction is an array
      newCrewMember.setVehiclerestriction(vehiclerestriction);
    }

    // Insert the crew member into the Supabase table
    const { data: insertedCrewMember, error: insertError } = await supabase
      .from('cabincrewmembers')
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


// GET route to get a specified number of crew members sorted by attendantid
app.get('/get-crew-members', async (req, res) => {
  try {
    // Extract the limit parameter from the query string
    const { limit } = req.query;
    
    // Convert the limit parameter to a number
    const limitNumber = limit ? parseInt(limit) : 10; // Default limit is 10 if not provided

    // Fetch the list of crew members from Supabase with sorting by attendant id and the specified limit
    const { data, error } = await supabase
      .from('cabincrewmembers')
      .select('*')
      .order('attendantid', { ascending: true }) // Sort by attendant id in ascending order
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



app.get('/find-crew-members', async (req, res) => {
  try {
    // Extract parameters from the query string
    const { attendanttype, vehiclerestriction, limit } = req.query;

    // Convert the limit parameter to a number
    const limitNumber = limit ? parseInt(limit) : undefined;

    // Fetch crew members from Supabase
    let { data: crewMembers, error } = await supabase
      .from('cabincrewmembers')
      .select('*');

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



// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the homepage');
});

app.get('/test-supabase', async (req, res) => {
  try {
    // Test connection by fetching aircraft data
    const { data, error } = await supabase
      .from('cabincrewmembers')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }
    res.json({ message: 'Supabase connected successfully', aircraftData: data });
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
