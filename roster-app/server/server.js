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

const verifyToken = require('./middleware/authMiddleware');

// Apply verifyToken middleware to protected routes
app.use('/cabin-crew', verifyToken, CabinCrewRouter);
app.use('/flight-info', verifyToken, FlightInfoRouter);
app.use('/flight-crew', verifyToken, FlightCrewRouter);
app.use('/passenger-info', verifyToken, PassengerCrewRouter);
app.use('/main-system', verifyToken, MainSystemRouter);
app.use('/aircraft', verifyToken, AircraftAPI);


const cabinCrewRouter = CabinCrewRouter(supabaseKey);

const flightInfoRouter = FlightInfoRouter(supabaseKey);

const flightCrewRouter = FlightCrewRouter(supabaseKey);

const passengerInfoRouter = PassengerCrewRouter(supabaseKey);
const mainSystemRouter = MainSystemRouter(supabaseKey);


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});