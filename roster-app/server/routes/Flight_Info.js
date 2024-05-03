const { createClient } = require('@supabase/supabase-js');
const express = require('express');

// Create a new router instance
const router = express.Router();

// Function to create the flight info router
module.exports = function createFlightInfoRouter(supabaseKey) {
    // Initialize Supabase client
    const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Endpoint to get flight information by flight number
    router.get('/find_flight_information', async (req, res) => {
        try {
            const {
                flight_num,
                date,
                time,
                origin_country,
                origin_city,
                origin_airport_name,
                origin_airport_code,
                destination_country,
                destination_city,
                vehicle_type,
                destination_airport_name,
                destination_airport_code,
                shared_flight_number,
                shared_flight_company
            } = req.query;
    
            let query = supabase.from('flight_info').select('*');
    
            if (flight_num) {
                query = query.eq('flight_num', flight_num);
            }
    
            if (date) {
                query = query.eq('date', date);
            }
            if (time){
                query = query.eq('time',time);
            }
    
            if (origin_country) {
                query = query.eq('origin_country', origin_country);
            }
    
            if (origin_city) {
                query = query.eq('origin_city', origin_city);
            }
    
            if (origin_airport_name) {
                query = query.eq('origin_airport_name', origin_airport_name);
            }
    
            if (origin_airport_code) {
                query = query.eq('origin_airport_code', origin_airport_code);
            }
    
            if (destination_country) {
                query = query.eq('destination_country', destination_country);
            }
    
            if (destination_city) {
                query = query.eq('destination_city', destination_city);
            }
    
            if (vehicle_type) {
                query = query.eq('vehicle_type', vehicle_type);
            }
    
            if (destination_airport_name) {
                query = query.eq('destination_airport_name', destination_airport_name);
            }
    
            if (destination_airport_code) {
                query = query.eq('destination_airport_code', destination_airport_code);
            }
    
            if (shared_flight_number) {
                query = query.eq('shared_flight_number', shared_flight_number);
            }
    
            if (shared_flight_company) {
                query = query.eq('shared_flight_company', shared_flight_company);
            }
    
            const { data, error } = await query;
    
            if (error) {
                throw error;
            }
    
            res.json(data);
        } catch (error) {
            console.error('Error fetching flight information:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // POST route to add flight information
router.post('/add-flight-info', async (req, res) => {
    try {
      const { limit } = req.query;
      
      // Convert the limit parameter to a number
      const limitNumber = limit ? parseInt(limit) : 5; // Default limit is 5 if not provided
      
      for (let i = 0; i < limitNumber; i++) {
        const flight_num = generateFlightNumber();
        const date = generateRandomDate();
        const time = generateRandomTime();
        // Generate a random distance between 800 and 8000
        const distance = Math.floor(Math.random() * (8000 - 800 + 1)) + 800;
  
        // Generate a random duration based on the distance
        const distanceFactor = Math.floor(Math.random() * (575 - 480 + 1)) + 480;
        const duration = Math.ceil(distance / distanceFactor) * 60;
  
        const shared = Math.random() < 0.2;
  
        let shared_flight_number = null;
        let shared_flight_company = null;
        if (shared) {
          // List of airline companies and their codes
          const airlines = [
            { name: "Emirates", code: "EK" },
            { name: "American Airlines", code: "AA" },
            { name: "Lufthansa", code: "LH" },
            { name: "British Airways", code: "BA" },
            { name: "Delta Air Lines", code: "DL" },
            { name: "Air France", code: "AF" },
            { name: "Singapore Airlines", code: "SQ" },
            { name: "Qantas Airways", code: "QF" },
            { name: "Cathay Pacific Airways", code: "CX" }
          ];
        
          // Randomly choose an airline company
          const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
        
          // Generate a random 4-digit flight number
          const flightNumber = Math.floor(1000 + Math.random() * 9000);
        
          shared_flight_number = `${randomAirline.code}${flightNumber}`;
          shared_flight_company = randomAirline.name;
        }
  
        // Extract flight information from the request body
       
        
        const{ data: aircrafts, error: aircraftError } = await supabase
        .from('aircrafts')
        .select('*');
  
        if(aircraftError) {
          throw aircraftError;
        }
        const vehicle_type = getRandomaircraft(aircrafts);
        //select a random aircraft
  
  
        // Fetch airports from Supabase
        const { data: airports, error: airportError } = await supabase
          .from('airports')
          .select('*');
    
        if (airportError) {
          throw airportError;
        }
    
        // Randomly select origin and destination airports
        const originAirport = getRandomAirport(airports);
        let destinationAirport;
        do {
          destinationAirport = getRandomAirport(airports);
        } while (destinationAirport['Airport Code'] === originAirport['Airport Code']);
    
        // Insert the flight information into the Supabase table
        const { data: insertedFlightInfo, error: insertError } = await supabase
          .from('flight_info')
          .insert({
            flight_num,
            date,
            time,
            duration,
            distance,
            origin_country: originAirport.Country,
            origin_city: originAirport.City,
            origin_airport_name: originAirport['Airport Name'],
            origin_airport_code: originAirport['Airport Code'],
            destination_country: destinationAirport.Country,
            destination_city: destinationAirport.City,
            destination_airport_name: destinationAirport['Airport Name'],
            destination_airport_code: destinationAirport['Airport Code'],
            vehicle_type,
            shared_flight_number,
            shared_flight_company
          });
    
        if (insertError) {
          throw insertError;
        }
      }
  
      res.status(201).json({ message: `Flight information added successfully for ${limitNumber} flights` });
    } catch (error) {
      console.error('Error adding flight information:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

  function getRandomaircraft(aircrafts) {
    const randomIndex = Math.floor(Math.random() * aircrafts.length);
    return aircrafts[randomIndex]['vehicletype'];
  }
  
  // Helper function to get a random airport from the list
  function getRandomAirport(airports) {
    const randomIndex = Math.floor(Math.random() * airports.length);
    return airports[randomIndex];
  }
  
// Helper function to generate flight number
  function generateFlightNumber() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `TK${randomNum}`;
  }
  
  // Helper function to generate a random date between 03-05-2024:00.00 to 03-05-2026:23.59
  function generateRandomDate() {
    const start = new Date(2024, 4, 3, 0, 0); // 03-05-2024:00.00
    const end = new Date(2026, 4, 3, 23, 59); // 03-05-2026:23.59
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime);
  }
// Helper function to generate a random time between 00:00 and 23:59
function generateRandomTime() {
    const hours = Math.floor(Math.random() * 24); // Random hour between 0 and 23
    const minutes = Math.floor(Math.random() * 60); // Random minute between 0 and 59
    // Format the hour and minute to ensure they have leading zeros if needed
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${formattedHours}:${formattedMinutes}`;
  }
  
    
    return router;
};



