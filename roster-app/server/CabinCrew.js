const faker = require('faker');

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
    "English", "Spanish", "Mandarin", "Hindi", "Arabic",
    "Bengali", "French", "Russian", "Portuguese", "Urdu",
    "German", "Japanese", "Swahili", "Korean", "Italian",
    "Turkish", "Dutch", "Polish", "Vietnamese", "Thai"
    // Add more languages as needed
];
const aircrafts = [
    "A320", "A330", "A380", "B777", "B787"
];



class CabinCrew {
    constructor(attendantid, name, age, gender, nationality, languages, attendanttype, vehiclerestriction, recipes) {
        this.attendantid = attendantid;
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
        return this.attendantid;
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
    setAttendantid(attendantid) {
        this.attendantid = attendantid;
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
    }

    setVehiclerestriction(vehiclerestriction) {
        this.vehiclerestriction = vehiclerestriction;
    }

    setRecipes(recipes) {
        this.recipes = recipes;
    }

    static generateRandom() {
        const attendantid = faker.datatype.number();
        const name = faker.name.findName();
        const age = faker.datatype.number({ min: 18, max: 60 });
        const gender = faker.random.arrayElement(["Male", "Female"]);
        const nationality = faker.address.country();
        const languages = faker.random.arrayElements(commonLanguages, faker.datatype.number({ min: 2, max: 2 }));
        const attendanttype = faker.random.arrayElement(["chief", "assistant", "chef"]);
        const vehiclerestriction = faker.random.arrayElements(aircrafts, faker.datatype.number({ min: 2, max: 2 }));
        let assignedRecipes = [];

        if (attendanttype === "chef") {
            assignedRecipes = faker.random.arrayElements(recipes, faker.datatype.number({ min: 2, max: 4 }));
        }

        return new CabinCrew(attendantid, name, age, gender, nationality, languages, attendanttype, vehiclerestriction, assignedRecipes);
    }

    toString() {
        return JSON.stringify(this);
    }
}

module.exports = { CabinCrew, commonLanguages, recipes, aircrafts };

