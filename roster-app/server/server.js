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
app.post('/crew-members', async (req, res) => {
  try {
    // Create a new crew member object from the request body
    const newCrewMember = CabinCrew.generateRandom();

    // Insert the crew member into the Supabase table
    const { data, error } = await supabase
      .from('cabincrewmembers')
      .insert(newCrewMember);

    if (error) {
      throw error;
    }

    res.status(201).json({ message: 'Crew member added successfully', crewMember: data });
  } catch (error) {
    console.error('Error adding crew member:', error.message); // Log the error message
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
