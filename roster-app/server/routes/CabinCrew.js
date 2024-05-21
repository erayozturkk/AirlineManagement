const faker = require('faker');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hsixajfgpamanbqvxyyw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaXhhamZncGFtYW5icXZ4eXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwNDI5NTYsImV4cCI6MjAyNjYxODk1Nn0.22DwSKkVdZYNPGqruamm-IQ5iQRnlnU3tF73GbwXP7E";
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

// Array of recipes
const recipes = [
    "spaghetti", "steak", "soup", "pizza", "hamburger", "burrito",
    "lasagna", "sushi", "fried rice", "pancakes", "omelette", 
    "chicken curry", "tacos", "macaroni and cheese", "pad thai",
    "grilled cheese sandwich", "chocolate cake", "apple pie",
    "chicken parmesan", "ramen", "mashed potatoes", "salmon",
    "caesar salad", "pasta carbonara", "fajitas",
    "beef stew", "enchiladas"
];
const commonLanguages = [
    "Spanish", "Mandarin", "Hindi", "Arabic",
    "Bengali", "French", "Russian", "Portuguese", "Urdu",
    "German", "Japanese", "Swahili", "Korean", "Italian",
    "Turkish", "Dutch", "Polish", "Vietnamese", "Thai"
    // Add more languages as needed
];



class CabinCrew {
    constructor(id, name, age, gender, nationality, languages, attendanttype, vehiclerestriction, recipes) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.nationality = nationality;
        this.languages = languages;
        this.attendanttype = attendanttype;
        this.vehiclerestriction = vehiclerestriction;
        this.recipes = recipes;
    }

    // Getters
    getAttendantid() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getAge() {
        return this.age;
    }

    getGender() {
        return this.gender;
    }

    getNationality() {
        return this.nationality;
    }

    getLanguages() {
        return this.languages;
    }

    getAttendanttype() {
        return this.attendanttype;
    }

    getVehiclerestriction() {
        return this.vehiclerestriction;
    }

    getRecipes() {
        return this.recipes;
    }

    // Setters
    setid(id) {
        this.id = id;
    }

    setName(name) {
        this.name = name;
    }

    setAge(age) {
        this.age = age;
    }

    setGender(gender) {
        this.gender = gender;
    }

    setNationality(nationality) {
        this.nationality = nationality;
    }

    setLanguages(languages) {
        this.languages = languages;
    }

    setAttendanttype(attendanttype) {
        this.attendanttype = attendanttype;
        if (attendanttype === "chef") {
            this.recipes = faker.random.arrayElements(recipes, faker.datatype.number({ min: 2, max: 4 }));
        }
    }

    setVehiclerestriction(vehiclerestriction) {
        this.vehiclerestriction = vehiclerestriction;
    }

    setRecipes(recipes) {
        this.recipes = recipes;
    }

    static generateRandom() {
        const id = faker.datatype.number();
        const name = faker.name.findName();
        const age = faker.datatype.number({ min: 18, max: 60 });
        const gender = faker.random.arrayElement(["Male", "Female"]);
        const nationality = faker.address.country();
        const languages = [ 'English', ...faker.random.arrayElements(commonLanguages, faker.datatype.number({ min: 1, max: 1 })) ];
        const attendanttype = faker.random.arrayElement(["chief", "regular", "chef"]);
        const vehiclerestriction = faker.random.arrayElements(aircrafts, faker.datatype.number({ min: 2, max: 2 }));
        let assignedRecipes = [];

        if (attendanttype === "chef") {
            assignedRecipes = faker.random.arrayElements(recipes, faker.datatype.number({ min: 2, max: 4 }));
        }

        return new CabinCrew(id, name, age, gender, nationality, languages, attendanttype, vehiclerestriction, assignedRecipes);
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = { CabinCrew, commonLanguages, recipes, aircrafts };















