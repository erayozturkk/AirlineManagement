require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');

const FlightInfoRouter = require('./routes/Flight_Info');
const CabinCrewRouter = require('./routes/Cabin_Crew_API');
const FlightCrewRouter = require('./routes/Flight_Crew_API');
const PassengerCrewRouter = require('./routes/Passenger_Info_API');
const MainSystemRouter = require('./routes/Main_System');
const AircraftAPI = require('./routes/aircraft_api');
const authRouter = require('./routes/authRoutes');
const cors = require('cors');

// Initialize Express app
const app = express();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('supabaseUrl and supabaseKey are required.');
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the homepage');
});

app.use('/auth', authRouter);
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
app.use('/aircraft', AircraftAPI);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});