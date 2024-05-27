const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const FlightInfoRouter = require('./Flight_Info');
const CabinCrewRouter = require('./Cabin_Crew_API');
const FlightCrewRouter = require('./Flight_Crew_API');
const PassengerCrewRouter = require('./Passenger_Info_API');

module.exports = function createMainSystemRouter(supabaseKey) {
  // Initialize Supabase client
  const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const cabinCrewRouter = CabinCrewRouter(supabaseKey);
  router.use('/cabin-crew', cabinCrewRouter);

  const flightInfoRouter = FlightInfoRouter(supabaseKey);
  router.use('/flight-info', flightInfoRouter);

  const flightCrewRouter = FlightCrewRouter(supabaseKey);
  router.use('/flight-crew', flightCrewRouter);

  const passengerInfoRouter = PassengerCrewRouter(supabaseKey);
  router.use('/passenger-info', passengerInfoRouter);

  router.post('/generate-flight-roster', async (req, res) => {
    try {
      const { flight_num } = req.query; // Use query parameters for GET requests
      
        // Check if a roster for the given flight_num already exists
      let query = supabase.from('flightrosters').select('*').eq('flightnum', flight_num).single();

      const { data: existingRoster, error: existingRosterError } = await query;

      if (existingRosterError && existingRosterError.code !== 'PGRST116') {
        // Handle any other errors except "No rows found" error
        throw existingRosterError;
      }

      if (existingRoster) {
        // If a roster already exists, throw an error
        return res.status(400).json({ error: 'A flight roster for this flight number already exists.' });
      }

      // Fetch flight information
      const flightInfoResponse = await axios.get('http://localhost:5001/flight-info/find_flight_information', {
        params: { flight_num },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const flightInfo = flightInfoResponse.data[0];
      const vtype = flightInfo['vehicle_type'];
      const varr = [];
      varr.push(vtype);
      const range = flightInfo['distance'];
      const R_date = flightInfo['date'];
      const R_time = flightInfo['time'];
      const R_duration = flightInfo['duration'];
      //fetch seating plan
      const{ data: aircrafts, error: aircraftError } = await supabase
      .from('aircrafts')
      .select('*')
      .eq('vehicletype',vtype)
      ;
      if(aircraftError) {
        throw aircraftError;
      }
      
      const max_seats = aircrafts[0].numberofseats;
      const seatingPlan = aircrafts[0].seatingplan;
      const LayoutB=seatingPlan["business"].layout;
      const LayoutE=seatingPlan["economy"].layout;
      const seatsPerRowB = LayoutB.split('-').reduce((total, num) => total + parseInt(num), 0);
      const seatsPerRowE = LayoutE.split('-').reduce((total, num) => total + parseInt(num), 0);
      const businessmax= seatingPlan["business"].rows*(seatingPlan['business'].layout.split('-').reduce((total, num) => total + parseInt(num), 0));

      // Fetch flight crew information
      const flightCrewids = (await selectCrew(vtype,range,R_date,R_time,R_duration)).map(crew => crew.id);
      // Fetch cabin crew information
      let cabincrewdata = await selectCabinCrew(varr,R_date,R_time,R_duration);
      const cabinCrewids = cabincrewdata[0].map(crew => crew.id),
            flightMenu = cabincrewdata[1];
      // Fetch passengers information
      const passengersResponse = await axios.get('http://localhost:5001/passenger-info/get-passengers', {
        params: { flightnum: flight_num },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const passengers = passengersResponse.data;
      const passengerids = passengersResponse.data.map(passenger => passenger.id);
      const occupiedseats = passengersResponse.data
      .filter(passenger => passenger.seatnumber !== null)
      .map(passenger => passenger.seatnumber);

      let B =0;
      let E =0;
      const passengerarray = [] ;
      for(let i= 0;i<passengers.length;i++){
        let changed=false;
        let passenger = passengers[i];
        if(passenger.parentid){break}
        if(!passenger.seatnumber){
          
          if(passenger.affiliatedpassenger){                                         ///////if seatnumber does not exist
            for(let affiliatedpassengerid of passenger.affiliatedpassenger) {
              if(passengerids.includes(affiliatedpassengerid)){
                let affiliatedPassenger = passengers.find(p => p.id === affiliatedpassengerid);
                if(affiliatedPassenger.seatnumber && (affiliatedPassenger.seattype===passenger.seattype)){
                  const layout = seatingPlan[affiliatedPassenger.seattype].layout;///buraya kadar np
                  const seatsPerRow = layout.split('-').reduce((total, num) => total + parseInt(num), 0);
                  if(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)===65){
                    if(!occupiedseats.includes(affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)+1))){
                      passenger.seatnumber=affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)+1);
                      changed=true;
                      break;
                    }
                  }
                  else if(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)===64+seatsPerRow){
                    if(!occupiedseats.includes(affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)-1))){
                      passenger.seatnumber=affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)-1);
                      changed=true;
                      break;
                    }
                  }
                  else{
                    if(!occupiedseats.includes(affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)+1))){
                      passenger.seatnumber=affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)+1);
                      changed=true;
                      break;
                    }
                    else if(!occupiedseats.includes(affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)-1))){
                      passenger.seatnumber=affiliatedPassenger.seatnumber.slice(0,-1) + String.fromCharCode(affiliatedPassenger.seatnumber.charCodeAt(affiliatedPassenger.seatnumber.length-1)-1);
                      changed=true;
                      break;
                    }
                  }
                }
              }
            }
          }
        



        if(!changed){
          
          if(passenger.seattype=='business'){
            for(let i=B;i<=businessmax;i++){
              let char = String.fromCharCode(i%seatsPerRowB+65);
              let row = ((i-(i%seatsPerRowB))/seatsPerRowB)+1;
              B++;
              if(!occupiedseats.includes(row+char)){
                passenger.seatnumber=row+char;
                break
              }
            }
          }
          if(passenger.seattype==['economy']){
            for(let i=businessmax+E;i<=max_seats;i++){
              let char = String.fromCharCode((i-businessmax)%seatsPerRowE+65);
              let row = (((i-businessmax)-(i-businessmax)%seatsPerRowE)/seatsPerRowE)+seatingPlan["business"].rows+1;
              E++;
              if(!occupiedseats.includes(row+char)){
                passenger.seatnumber=row+char;
                break
              }
            }
          }
        }
      }
        occupiedseats.push(passenger.seatnumber);
        passengerarray.push(passenger);

      }
      const UpdatedPassengerResponse = await axios.put('http://localhost:5001/passenger-info/update-passengers', 
      { passengerarray }, {
      headers: { 'Content-Type': 'application/json' }
      });
       // Fetch the last roster_id
       const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
       .from('flightrosters')
       .select('rosterid')
       .order('rosterid', { ascending: false })
       .limit(1);

        if (lastCrewMemberError) {
          throw lastCrewMemberError;
        }
        // Calculate the next available id
        let nextId;
      if (lastCrewMember && lastCrewMember.length > 0) {
        nextId = lastCrewMember[0].rosterid + 1;
      } else {
        nextId = 1;
      }
      
      for (let food of flightMenu){
        flightInfo.flight_menu.push(food);
      }
      const flight_infoarray= []
      flight_infoarray.push(flightInfo);
      const Updat = await axios.put('http://localhost:5001/flight-info/update-flight-info', 
        { flight_infoarray }, {
        headers: { 'Content-Type': 'application/json' }
        });
      // Insert the new flight roster data
        const { error: insertError } = await supabase
        .from('flightrosters')
        .insert([
          {
            rosterid: nextId,
            flightnum: flight_num,
            pilotids: flightCrewids,
            cabincrewids: cabinCrewids,
            passengerids: passengerids
          }
        ]);

      if (insertError) {
        throw insertError;
      }
      // Combine all data into a single response
      res.json({ message: 'Flight roster generated and saved successfully', roster_id: nextId });
    } catch (error) {
      console.error('Error generating flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.delete('/delete-flight-roster', async (req, res) => {
    try {
      const { flight_num } = req.query;
      
      if (!flight_num) {
        return res.status(400).json({ error: 'Flight number is required' });
      }
  
      let a=flight_num.toString();
  
      const { error } = await supabase
        .from('flightrosters')
        .delete()
        .eq('flightnum', a);

  
      if (error) {
        throw error;
      }

  
      res.status(200).json({ message: 'Flight roster deleted successfully' });
    } catch (error) {
      console.error('Error deleting flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.get('/get-tabular-view', async (req, res) => {
    try {
      const { flightnum: flightnum } = req.query; // Use query parameters for GET requests
  
      // Fetch flight information
      const flightInfoResponse = await axios.get('http://localhost:5001/flight-info/find_flight_information', {
        params: { flight_num: flightnum },
        headers: { 'Content-Type': 'application/json' }
      });
  
      const flightInfo = flightInfoResponse.data;
      const vtype = flightInfo['vehicle_type'];
      const range = flightInfo['distance'];
  
      // Fetch pilotids
      const { data: pilotData, error: pilotError } = await supabase
        .from('flightrosters')
        .select('pilotids')
        .eq('flightnum', flightnum);
  
      if (pilotError) {
        console.error('Error fetching pilotids:', pilotError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const pilotIds = pilotData.length > 0 ? pilotData[0].pilotids : [];
  
      // Fetch cabincrewids
      const { data: cabinCrewData, error: cabinCrewError } = await supabase
        .from('flightrosters')
        .select('cabincrewids')
        .eq('flightnum', flightnum);
  
      if (cabinCrewError) {
        console.error('Error fetching cabincrewids:', cabinCrewError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const cabinCrewIds = cabinCrewData.length > 0 ? cabinCrewData[0].cabincrewids : [];
  
      // Fetch pilot details from the defined endpoint
      const pilotDetailsResponse = await axios.get('http://localhost:5001/flight-crew/get-crew-members-list', {
        params: { ids: pilotIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const pilots = pilotDetailsResponse.data.map(pilot => ({
        id: pilot.id,
        name: pilot.name,
        peopletype: `${pilot.seniorityLevel} Pilot`
      }));

  
      // Fetch cabin crew details from the defined endpoint
      const cabinCrewDetailsResponse = await axios.get('http://localhost:5001/cabin-crew/get-crew-members-list', {
        params: { ids: cabinCrewIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const cabinCrew = cabinCrewDetailsResponse.data.map(crew => ({
        id: crew.id,
        name: crew.name,
        peopletype: crew.attendanttype === 'chef' ? 'Chef' : `${crew.attendanttype} Crew`
      }));

  
      // Fetch passenger details from the defined endpoint
      const passengersResponse = await axios.get('http://localhost:5001/passenger-info/get-passengers', {
        params: { flightnum: flightnum },
        headers: { 'Content-Type': 'application/json' }
      });
      const passengers = passengersResponse.data.map(passenger => ({
        id: passenger.id,
        name: passenger.name,
        peopletype: 'passenger'
      }));
  
      // Combine all data and sort by name
      // Sort each array individually
      const sortedPilots = pilots.sort((a, b) => a.name.localeCompare(b.name));
      const sortedCabinCrew = cabinCrew.sort((a, b) => a.name.localeCompare(b.name));
      const sortedPassengers = passengers.sort((a, b) => a.name.localeCompare(b.name));

      // Combine the sorted arrays
      const combinedRoster = [...sortedPilots, ...sortedCabinCrew, ...sortedPassengers];

  
      // Send the response
      res.json(combinedRoster);
  
    } catch (error) {
      console.error('Error fetching flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/get-extended-view', async (req, res) => {
    try {
      const { flight_num: flightnum } = req.query; // Use query parameters for GET requests
  
      // Fetch flight information
      const flightInfoResponse = await axios.get('http://localhost:5001/flight-info/find_flight_information', {
        params: { flight_num: flightnum },
        headers: { 'Content-Type': 'application/json' }
      });
  
      const flightInfo = flightInfoResponse.data;
      const vtype = flightInfo['vehicle_type'];
      const range = flightInfo['distance'];
  
      // Fetch pilotids
      const { data: pilotData, error: pilotError } = await supabase
        .from('flightrosters')
        .select('pilotids')
        .eq('flightnum', flightnum);
  
      if (pilotError) {
        console.error('Error fetching pilotids:', pilotError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const pilotIds = pilotData.length > 0 ? pilotData[0].pilotids : [];
  
      // Fetch cabincrewids
      const { data: cabinCrewData, error: cabinCrewError } = await supabase
        .from('flightrosters')
        .select('cabincrewids')
        .eq('flightnum', flightnum);
  
      if (cabinCrewError) {
        console.error('Error fetching cabincrewids:', cabinCrewError.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      const cabinCrewIds = cabinCrewData.length > 0 ? cabinCrewData[0].cabincrewids : [];

  
      // Fetch pilot details from the defined endpoint
      const pilotDetailsResponse = await axios.get('http://localhost:5001/flight-crew/get-crew-members-list', {
        params: { ids: pilotIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const pilots = pilotDetailsResponse.data;
  
      // Fetch cabin crew details from the defined endpoint
      const cabinCrewDetailsResponse = await axios.get('http://localhost:5001/cabin-crew/get-crew-members-list', {
        params: { ids: cabinCrewIds.join(',') },
        headers: { 'Content-Type': 'application/json' }
      });
      const cabinCrew = cabinCrewDetailsResponse.data;

      const passengersResponse = await axios.get('http://localhost:5001/passenger-info/get-passengers', {
        params: { flightnum: flightnum },
        headers: { 'Content-Type': 'application/json' }
      });
      const passengers = passengersResponse.data;
  
      // Combine all data
      const flightRoster = {
        pilots,
        cabinCrew,
        passengers
      };
  
      res.json(flightRoster);
  
    } catch (error) {
      console.error('Error fetching flight roster:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
async function getFilteredCrewMembers(vehicleRestriction, allowedRange, flightDate, flightTime, flightDuration) {
    try {
        // Fetch all matching crew members
        const crewResponse = await axios.get('http://localhost:5001/flight-crew/find-crew-members', {
            params: { vehicleRestriction: vehicleRestriction, allowedRange: allowedRange },
            headers: { 'Content-Type': 'application/json' }
        });
        const crewMembers = crewResponse.data;
        const availableCrew = [];
        
        for(let crewMember of crewMembers){
          if(crewMember.flight_times){ // all flight times of this pilot
            let isAvailable= true;
            for(let flight_time of crewMember.flight_times){
              if(isTimeConflict(flightDate,flightTime,flightDuration,flight_time['date'],flight_time['time'],flight_time['duration'])){// if we find a time conflict
                isAvailable = false;
                break;
              }
            }
            if(isAvailable){
              availableCrew.push(crewMember);
            }
          }
          else{// if there are no flights assigned for that pilot
            availableCrew.push(crewMember);
          }
        }
        return availableCrew;
    } catch (error) {
        console.error('Error fetching and filtering crew members:', error.message);
        throw error;
    }
}

async function getFilteredCabinCrewMembers(vehicleRestriction, flightDate, flightTime, flightDuration) {
  try {
      const cabinCrewResponse = await axios.get('http://localhost:5001/cabin-crew/find-crew-members', {
          params: { vehiclerestriction: vehicleRestriction },
          headers: { 'Content-Type': 'application/json' }
      });
      const cabinCrewMembers = cabinCrewResponse.data;
      const availableCrew = [];
      for (let crewMember of cabinCrewMembers) {
        if(crewMember.flight_times){ // all flight times of this cabin crew member
          let isAvailable= true;
          for(let flight_time of crewMember.flight_times){
            if(isTimeConflict(flightDate,flightTime,flightDuration,flight_time['date'],flight_time['time'],flight_time['duration'])){// if we find a time conflict
              isAvailable = false;
              break;
            }
          }
          if(isAvailable){
            availableCrew.push(crewMember);
          }
        }
        else{// if there are no flights assigned for that cabin crew member
          availableCrew.push(crewMember);
        }
      }
      return availableCrew;
  } catch (error) {
      console.error('Error fetching and filtering cabin crew members:', error.message);
      throw error;
  }
}

// Helper function to check if given times conflict
function isTimeConflict(R_date, R_time, R_duration, C_date, C_time, C_duration) {
    const startR = new Date(`${R_date}T${R_time}`);
    const endR = new Date(startR.getTime() + R_duration * 60 * 1000);

    const startC = new Date(`${C_date}T${C_time}`);
    const endC = new Date(startC.getTime() + C_duration * 60 * 1000);

    return !(startR >= endC || startC >= endR);
}


async function selectCrew(vehicleRestriction, allowedRange, flightDate, flightTime, flightDuration) {
  const availableCrew = await getFilteredCrewMembers(vehicleRestriction, allowedRange, flightDate, flightTime, flightDuration);
  
  const seniorPilots = availableCrew.filter(crew => crew.seniorityLevel === 'Senior');
  const juniorPilots = availableCrew.filter(crew => crew.seniorityLevel === 'Junior');
  const trainees = availableCrew.filter(crew => crew.seniorityLevel === 'Trainee');
  if (seniorPilots.length < 1 || juniorPilots.length < 1) {
      throw Error('Not enough senior or junior pilots available');
  }

  const selectedCrew = [];
  selectedCrew.push(seniorPilots[0]); // At least one senior pilot
  selectedCrew.push(juniorPilots[0]); // At least one junior pilot

  let traineeCount = 0;
  for (let trainee of trainees) {
      if (traineeCount < 2) {
          selectedCrew.push(trainee);
          traineeCount++;
      } else {
          break;
      }
  }

  return selectedCrew;
}

async function selectCabinCrew(vehicleRestriction, flightDate, flightTime, flightDuration) {
  const availableCabinCrew = await getFilteredCabinCrewMembers(vehicleRestriction, flightDate, flightTime, flightDuration);

  const seniorAttendants = availableCabinCrew.filter(crew => crew.attendanttype === 'chief');
  const juniorAttendants = availableCabinCrew.filter(crew => crew.attendanttype === 'regular');
  const chefs = availableCabinCrew.filter(crew => crew.attendanttype === 'chef');

  if (seniorAttendants.length < 1 || juniorAttendants.length < 4) {
      throw new Error('Not enough senior or junior attendants available');
  }
  const shuffledsenior = seniorAttendants.sort(()=> 0.5 - Math.random());
  const shuffledjunior = juniorAttendants.sort(()=> 0.5 - Math.random());
  const shufflechefs = chefs.sort(()=> 0.5 - Math.random());
  const selectedCrew = [];
  selectedCrew.push(...shuffledsenior.slice(0, Math.min(seniorAttendants.length, 4))); // 1-4 senior attendants
  selectedCrew.push(...shuffledjunior.slice(0, Math.min(juniorAttendants.length, 16))); // 4-16 junior attendants
  const flightmenu = [];
  const chefCount = Math.min(chefs.length, 2);
  for (let i = 0; i < chefCount; i++) {
      const chef = shufflechefs[i];
      selectedCrew.push(chef);

      // Add a random dish from the chef to the flight menu
      let dish = chef.recipes[Math.floor(Math.random() * chef.recipes.length)];
      dish = dish[0].toUpperCase() + dish.slice(1);

      if(!flightmenu.includes(dish)){
        flightmenu.push(dish);
      }
  }


  return [selectedCrew,flightmenu];
}






return router;
};
