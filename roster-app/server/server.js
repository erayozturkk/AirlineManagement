require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
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
