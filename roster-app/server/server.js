require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');

const FlightInfoRouter = require('./routes/Flight_Info');
const CabinCrewRouter = require('./routes/Cabin_Crew_API');
const FlightCrewRouter = require('./routes/Flight_Crew_API');
const PassengerCrewRouter = require('./routes/Passenger_Info_API');
const MainSystemRouter = require('./routes/Main_System');

// Initialize Express app
const app = express();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('supabaseUrl and supabaseKey are required.');
}
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
    // Test connection by fetching cabin crew data
    const { data, error } = await supabase
      .from('cabin_crew')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }
    res.json({ message: 'Supabase connected successfully', crewData: data });
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const cabinCrewRouter = CabinCrewRouter(supabaseKey);
app.use('/cabin-crew', cabinCrewRouter);
const flightInfoRouter = FlightInfoRouter(supabaseKey);
app.use('/flight-info', flightInfoRouter);
const flightCrewRouter = FlightCrewRouter(supabaseKey);
app.use('/flight-crew', flightCrewRouter);
const passengerInfoRouter = PassengerCrewRouter(supabaseKey);
app.use('/passenger-info', passengerInfoRouter);
const mainSystemRouter = MainSystemRouter(supabaseKey);
app.use('/main-system', mainSystemRouter);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
