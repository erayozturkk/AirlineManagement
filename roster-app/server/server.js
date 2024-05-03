require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');

const FlightInfoRouter = require('./routes/Flight_Info');
const CabinCrewRouter = require('./routes/Cabin_Crew_API');
const FlightCrewRouter = require('./routes/Flight_Crew_API')

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


const cabinCrewRouter = CabinCrewRouter(supabaseKey);
app.use('/cabin-crew', cabinCrewRouter);
//FLight Info Rout...
const flightInfoRouter = FlightInfoRouter(supabaseKey);
app.use('/flight-info', flightInfoRouter);
const flightCrewRouter = FlightCrewRouter(supabaseKey);
app.use('/flight-crew', flightCrewRouter);



// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
