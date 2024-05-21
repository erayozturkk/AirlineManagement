require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRouter = require('./routes/authRoutes');
const FlightInfoRouter = require('./routes/Flight_Info');
const CabinCrewRouter = require('./routes/Cabin_Crew_API');
const FlightCrewRouter = require('./routes/Flight_Crew_API');
const AircraftAPI = require('./routes/aircraft_api');
// const PassangerCrewRouter = require('./routes/Passanger_Info_API');

// Initialize Express app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Use CORS middleware
app.use(cors()); // Enable all CORS requests

// parse application/json
app.use(bodyParser.json());

// Define the home route
app.get('/', (req, res) => {
  res.send('Welcome to the homepage');
});

// Mount routers
app.use('/auth', authRouter);
app.use('/flight-info', FlightInfoRouter);
app.use('/cabin-crew', CabinCrewRouter);
app.use('/flight-crew', FlightCrewRouter);
app.use('/aircraft', AircraftAPI);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
