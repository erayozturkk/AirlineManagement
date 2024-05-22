const faker = require('faker');
const {  commonLanguages } = require('./CabinCrew')
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let aircrafts = [];

// Function to fetch aircrafts data
async function fetchAircrafts() {
  const { data: aircraftData, error: aircraftError } = await supabase
    .from('aircrafts')
    .select('vehicletype');
    
  if (aircraftError) {
    throw aircraftError;
  }

  aircrafts = aircraftData.map(aircraft => aircraft.vehicletype);
}

// Call fetchAircrafts to initialize aircrafts array
fetchAircrafts().catch(console.error);

class Pilot {
    constructor(id, name, age, gender, nationality, languages, vehicleRestriction, seniorityLevel) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.nationality = nationality;
        this.languages = languages;
        this.vehicleRestriction = vehicleRestriction;
        this.seniorityLevel = seniorityLevel;
        this.allowedRange = this.calculateMaxAllowedRange();
    }
    calculateMaxAllowedRange() {
        if (this.seniorityLevel === 'Senior') {
            return this.getRandomIntInRange(30, 80) * 100; // Random number between 3000-8000 in increments of 100
        } else if (this.seniorityLevel === 'Junior') {
            return this.getRandomIntInRange(20, 40) * 100; // Random number between 2000-4000 in increments of 100
        } else if (this.seniorityLevel === 'Trainee') {
            return this.getRandomIntInRange(10, 25) * 100; // Random number between 1000-2500 in increments of 100
        } else {
            return 0; // Default value if seniority level is not specified or invalid
        }
    }

    getRandomIntInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    static generateRandom() {
        const id = faker.datatype.number();
        const name = faker.name.findName();
        const age = faker.datatype.number({ min: 18, max: 60 });
        const gender = faker.random.arrayElement(["Male", "Female"]);
        const nationality = faker.address.country();
        const languages = [ 'English', ...faker.random.arrayElements(commonLanguages, faker.datatype.number({ min: 1, max: 1 })) ];
        const vehicleRestriction = faker.random.arrayElement(aircrafts); // Adjust as needed
        const seniorityLevel = faker.random.arrayElement(["Senior", "Junior", "Trainee"]);
    
        return new Pilot(id, name, age, gender, nationality, languages, vehicleRestriction, seniorityLevel);
    }


    toString() {
        return JSON.stringify(this);
    }
    
}

module.exports = { Pilot};



