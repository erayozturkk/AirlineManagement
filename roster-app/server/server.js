require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaXhhamZncGFtYW5icXZ4eXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwNDI5NTYsImV4cCI6MjAyNjYxODk1Nn0.22DwSKkVdZYNPGqruamm-IQ5iQRnlnU3tF73GbwXP7E";
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Create a new crew member object with the next available ID
    const newCrewMember = CabinCrew.generateRandom();
    newCrewMember.attendantid = nextId;

    // Insert the crew member into the Supabase table
    const { data: insertedCrewMember, error: insertError } = await supabase
      .from('cabincrewmembers')
      .insert(newCrewMember);

    if (insertError) {
      throw insertError;
    }

    res.status(201).json({ message: 'Crew member added successfully', crewMember: insertedCrewMember });
  } catch (error) {
    console.error('Error adding crew member:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get-crew-members', async (req, res) => {
  try {
    // Fetch a random crew member from Supabase
    const { data, error } = await supabase
      .from('cabincrewmembers')
      .select('*')
      .limit(4);

    if (error) {
      throw error;
    }

    res.json({ message: 'Supabase connected successfully', CrewMembers: data });
  } catch (error) {
    console.error('Supabase connection error:', error.message);
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
