require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaXhhamZncGFtYW5icXZ4eXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwNDI5NTYsImV4cCI6MjAyNjYxODk1Nn0.22DwSKkVdZYNPGqruamm-IQ5iQRnlnU3tF73GbwXP7E";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the homepage');
});

app.get('/test-supabase', async (req, res) => {
  try {
    // Test connection by fetching aircraft data
    const { data, error } = await supabase
      .from('aircrafts')
      .select('*')
      .limit(5);

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
