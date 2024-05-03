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
      const {
        flight_num,
        date,
        time,
        duration,
        distance,
        origin_airport_name,
        vehicle_type,
        destination_airport_name,
        shared_flight_number,
        shared_flight_company,
        limit
    } = req.query;
      
    let limitNumber;
    if(limit){
      limitNumber=parseInt(limit);
    }
    else{
      limitNumber=5;
    }
      
      for (let i = 0; i < limitNumber; i++) {


        //ganerate random flight number if not provided in request
        let toinFlightNumber;
        if(flight_num){
          toinFlightNumber=flight_num;
        }
        else{
          toinFlightNumber = generateFlightNumber();
        }


        //ganerate random date if not provided in request
        let toinDate;
        if(date){
          toinDate=date;
        }
        else{
          toinDate = generateRandomDate();
        }


        //ganerate random time if not provided in request
        let toinTime;
        if(time){
          toinTime=time;
        }
        else{
          toinTime = generateRandomTime();
        }


        //ganerate random duration if not provided in request
        let toinDuration;
        if(duration){
          toinDuration=duration;
        }
        else{
          // Generate a random distance between 800 and 8000
          const distance = Math.floor(Math.random() * (8000 - 800 + 1)) + 800;
          // Generate a random duration based on the distance theese values are expected speeds of a passanger plane
          const distanceFactor = Math.floor(Math.random() * (575 - 480 + 1)) + 480;
          toinDuration = Math.ceil(distance / distanceFactor) * 60;
    
        }

        let toinDistance;
        if(distance){
          toinDistance=distance;
        }
        else{
          // Generate a random distance between 800 and 8000
           toinDistance = Math.floor(Math.random() * (8000 - 800 + 1)) + 800;
        }


        //ganerate random airport if not provided in request
        let toinOriginairport;
        let toinDestinationairport;
        // Fetch airports from Supabase
        const { data: airports, error: airportError } = await supabase
        .from('airports')
        .select('*');  
        if (airportError) {
          throw airportError;
        }
        if(origin_airport_name){
        const matchedAirport = airports.find(airport => airport['Airport Name'] === origin_airport_name);
        if(!matchedAirport){
          throw new Error(`Origin airport "${origin_airport_name}" not found in the database.`);
        }
        else{
          toinOriginairport=matchedAirport;
        }
        }
        else{
          toinOriginairport  = getRandomAirport(airports);;
        }
        if(destination_airport_name){
          const matchedAirport = airports.find(airport => airport['Airport Name'] === destination_airport_name);
          if(!matchedAirport){
            throw new Error(`Origin airport "${destination_airport_name}" not found in the database.`);
          }
          else{
            if(matchedAirport['Airport Name']===toinOriginairport['Airport Name']){
              throw new Error(`Destination airport can not be same with the origin airport.`);
            }
            else{
              toinDestinationairport = matchedAirport;
            }
          }
        }
        else{
          do {
            toinDestinationairport = getRandomAirport(airports);
          } while (toinDestinationairport['Airport Code'] === toinOriginairport['Airport Code']);
        }
        
        




        //generate random shared flight company and shared flight number from a array if it is not provided in request 
        //if Shared flight company is provided but there is no flight number create a random flight number starting with first two letters of that company name
        let toinSharedflightcompany;
        let toinSharedflightnumber;
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
        if(shared_flight_company){
          toinSharedflightcompany=shared_flight_company;

          if(!airlines.find(airline => airline.name === toinSharedflightcompany)){
            const newairline={name: shared_flight_company,code: shared_flight_company.substring(0, 2).toUpperCase()}
            airlines.push(newairline);
          }
          if(shared_flight_number){
            toinSharedflightnumber=shared_flight_number
          }
          else{
            const flightNumber = Math.floor(1000 + Math.random() * 9000);
            const Airline=airlines.find(airline => airline.name === toinSharedflightcompany);
            toinSharedflightnumber=`${Airline.code}${flightNumber}`;
          }
        }
        else{
          if(!shared_flight_number){
            const shared = Math.random() < 0.2;
            if (shared) {
              // Randomly choose an airline company
              const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
              // Generate a random 4-digit flight number
              const flightNumber = Math.floor(1000 + Math.random() * 9000);
              toinSharedflightnumber = `${randomAirline.code}${flightNumber}`;
              toinSharedflightcompany = randomAirline.name;
            }
          }
          else{
            toinSharedflightnumber=shared_flight_number;
            const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
            toinSharedflightcompany = randomAirline.name;
          }
        }


        let toinVehicle
        const{ data: aircrafts, error: aircraftError } = await supabase
        .from('aircrafts')
        .select('*');
        if(aircraftError) {
          throw aircraftError;
        }


        if(vehicle_type){
          const matchedVehicle=aircrafts.find(aircrafts=>aircrafts['vehicletype']===vehicle_type);
          if(!matchedVehicle){
            throw new Error(`Provided vehicletype "${vehicle_type}" is not in the database`)
          }
          else{
            toinVehicle=matchedVehicle;
          }
        }
        else{
          toinVehicle = getRandomaircraft(aircrafts);
        }



    
        // Insert the flight information into the Supabase table
        const { data: insertedFlightInfo, error: insertError } = await supabase
          .from('flight_info')
          .insert({
            flight_num: toinFlightNumber,
            date: toinDate,
            duration: toinDuration,
            distance: toinDistance,
            origin_country: toinOriginairport.Country,
            origin_city: toinOriginairport.City,
            origin_airport_name: toinOriginairport['Airport Name'],
            origin_airport_code: toinOriginairport['Airport Code'],
            destination_country: toinDestinationairport.Country,
            destination_city: toinDestinationairport.City,
            destination_airport_name: toinDestinationairport['Airport Name'],
            destination_airport_code: toinDestinationairport['Airport Code'],
            vehicle_type: toinVehicle,
            shared_flight_number: toinSharedflightnumber,
            shared_flight_company: toinSharedflightcompany,
            time: toinTime
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



