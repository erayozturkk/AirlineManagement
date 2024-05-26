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
              duration,
              distance,
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
  
          const queryParams = {
              flight_num,
              date,
              time,
              origin_country,
              origin_city,
              duration,
              distance,
              origin_airport_name,
              origin_airport_code,
              destination_country,
              destination_city,
              vehicle_type,
              destination_airport_name,
              destination_airport_code,
              shared_flight_number,
              shared_flight_company
          };
  
          Object.keys(queryParams).forEach(key => {
              if (queryParams[key]) {
                  query = query.eq(key, queryParams[key]);
              }
          });
  
          const { data, error } = await query;
  
          if (error) {
              console.error('Error fetching flight information:', error.message);
              return res.status(500).json({ error: 'Internal server error' });
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

    // Input checks
    if (limit &&(isNaN(limit) || limit < 1)) {
      return res.status(400).json({ error: `Limit should be a positive integer limit: ${limit}`   });
    }
    if(flight_num&&!(flight_num.substring(0, 2).toUpperCase() === "TK")){
      return res.status(400).json({ error: `The flight_num should start with TK: ${flight_num}`   });
    }
    if(flight_num&& isNaN(flight_num.substring(3))){
      return res.status(400).json({ error: `The flight_num should continue with digits after first two chars: ${flight_num}`});
    }
    if(flight_num&& flight_num.length!= 6){
      return res.status(400).json({ error: `The flight_num should continue with 4 digits after first two chars: ${flight_num}`});
    }
    let limitNumber;
    if(limit){
      limitNumber=parseInt(limit);
    }
    else{
      limitNumber=1;
    }

    const addedFlights = [];
    var shouldchange = false;
      for (let i = 0; i < limitNumber; i++) {


        // Generate random flight number if not provided in request
        let toinFlightNumber;
        if (flight_num) {
          toinFlightNumber = flight_num;
        } else {
          const { data: flight_info, error: flight_infoError } = await supabase
            .from('flight_info')
            .select('flight_num');

          if (flight_infoError) {
            throw flight_infoError;
          }

          do {
            toinFlightNumber = generateFlightNumber();
          } while (flight_info.some(info => info.flight_num === toinFlightNumber));
        }



        //ganerate random date if not provided in request
        let toinDate;
        if(date){
          if(!shouldchange){
            toinDate=date;
          }
          else{
            toinDate = generateRandomDate();
          }
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

        let toinDistance;
        if(distance){
          toinDistance=distance;
        }
        else{
          // Generate a random distance between 800 and 8000
           toinDistance = Math.floor(Math.random() * (8000 - 800 + 1)) + 800;
        }
        //ganerate random duration if not provided in request
        let toinDuration;
        if(duration){
          toinDuration=duration;
        }
        else{

          // Generate a random duration based on the distance theese values are expected speeds of a passanger plane
          const distanceFactor = Math.floor(Math.random() * (575 - 480 + 1)) + 480;
          toinDuration = Math.ceil(toinDistance / distanceFactor) * 60;
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
            return res.status(400).json({error:`Origin airport "${origin_airport_name}" not found in the database.`});
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
            return res.status(400).json({error:`Origin airport "${destination_airport_name}" not found in the database.`});
          }
          else{
            if(matchedAirport['Airport Name']===toinOriginairport['Airport Name']){
              return res.status(400).json({error:`Destination airport can not be same with the origin airport.`});
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
        
        
        //if Shared flight company is provided but there is no flight number create a random flight number starting with first two letters of that company name
        let toinSharedflightcompany;
        let toinSharedflightnumber;

        if(shared_flight_company){          
          toinSharedflightcompany=shared_flight_company;
          if(shared_flight_number){
            toinSharedflightnumber=shared_flight_number
          }
          else{
            const flightNumber = Math.floor(1000 + Math.random() * 9000);           
            toinSharedflightnumber=`${shared_flight_company.substring(0, 2).toUpperCase()}${flightNumber}`;
          }
        }
        else{
          toinSharedflightcompany= null;
          toinSharedflightnumber= null;
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
            return res.status(400).json({error:`Provided vehicletype "${vehicle_type}" is not in the database`})
          }
          else{
            toinVehicle=vehicle_type;
          }
        }
        else{
          toinVehicle = getRandomaircraft(aircrafts);
        }
        async function checkForUnique(date, time, origin_airport_name, destination_airport_name) {
          try {
              // Convert date to GMT string for consistency
              let gmtDateString;
              
              if(typeof date =="string"){
                gmtDateString = date;
                
              }
              else{
                gmtDateString = date.toISOString().split('T')[0];
              }

      
              // Format time to ensure consistent format
              const formattedTime = time.padStart(5, '0'); // Ensure time is in HH:MM format
              const { data: existingFlights, error: flight_infoError } = await supabase
                  .from('flight_info')
                  .select('*')
                  .eq('date', gmtDateString)
                  .eq('time', formattedTime)
                  .eq('origin_airport_name', origin_airport_name)
                  .eq('destination_airport_name', destination_airport_name);
      
              if (flight_infoError) {
                  throw flight_infoError;
              }
              if(existingFlights.length === 0){
                return true;
              }
              else{
                return false;
              }
          } catch (error) {
              console.error('Error checking for unique flights:', error.message);
              return false; // Return false to indicate an error occurred
          }
      }
      
      //const toinmenu = toinVehicle.flight_menu
      const matchedVehicle=aircrafts.find(aircrafts=>aircrafts['vehicletype']===toinVehicle);

        // Insert the flight information into the Supabase table
        if(await checkForUnique(toinDate,toinTime,toinOriginairport['Airport Name'],toinDestinationairport['Airport Name'])){
          shouldchange=false;
          if(typeof toinDate =="string"){
          }
          else{
            toinDate = toinDate.toISOString().split('T')[0];
          }
          const newFlightInfo = {
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
            time: toinTime,
            flight_menu: matchedVehicle.flight_menu
            
          };
        const { data: insertedFlightInfo, error: insertError } = await supabase
          .from('flight_info')
          .insert(newFlightInfo);
    
        if (insertError) {
          throw insertError;
        }

        addedFlights.push(newFlightInfo);
      }
      else{
        shouldchange = true;
        i--;
      }
    }
  
      res.status(201).json({ message: `Flight information added successfully for ${limitNumber} flights`, addedFlights});
    } catch (error) {
      console.error('Error adding flight information:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.put('/update-flight-info', async (req, res) => {
    try {
      const { flight_infoarray } = req.body; // Expecting an array of flight info objects
  
      const updatePromises = flight_infoarray.map(async (flightInfo) => {
        const { flight_num, ...updateData } = flightInfo;
        const { data, error } = await supabase
          .from('flight_info')
          .update(updateData)
          .eq('flight_num', flight_num);
  
        if (error) {
          throw error;
        }
        return data;
      });
  
      const results = await Promise.all(updatePromises);
      res.status(200).json({ message: 'Flight_info updated successfully' });
    } catch (error) {
      console.error('Error updating flight information:', error.message);
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
  
// Helper function to generate a random date between 03-05-2024:00.00 to 03-05-2026:23.59 in UTC format
function generateRandomDate() {
  const start = new Date(2024, 4, 3); // 03-05-2024:00.00 UTC
  const end = new Date(2026, 4, 3); // 03-05-2026:23.59 UTC
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}



// Helper function to generate a random time in "HH:MM" format
function generateRandomTime() {
  const hours = Math.floor(Math.random() * 24); // Random hour between 0 and 23
  const minutes = Math.floor(Math.random() * 60); // Random minute between 0 and 59
  // Format the hour and minute to ensure they have leading zeros if needed
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${formattedHours}:${formattedMinutes}`;
}





  return router;
}
