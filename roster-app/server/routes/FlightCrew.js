const faker = require('faker');
const commonLanguages = [
    "Spanish", "Mandarin", "Hindi", "Arabic",
    "Bengali", "French", "Russian", "Portuguese", "Urdu",
    "German", "Japanese", "Swahili", "Korean", "Italian",
    "Turkish", "Dutch", "Polish", "Vietnamese", "Thai"
    // Add more languages as needed
];
const aircrafts = [
    "Airbus A320", "Airbus A330", "Airbus A380", "Boeing 777", "Boeing 787"
];


class Pilot {
    constructor(pilotId, name, age, gender, nationality, languages, vehicleRestriction, seniorityLevel) {
        this.pilotId = pilotId;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.nationality = nationality;
        this.languages = languages;
        this.vehicleRestriction = vehicleRestriction;
        this.allowedRange = this.calculateMaxAllowedRange;
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
        const pilotId = faker.datatype.uuid();
        const name = faker.name.findName();
        const age = faker.datatype.number({ min: 18, max: 60 });
        const gender = faker.random.arrayElement(["Male", "Female"]);
        const nationality = faker.address.country();
        const languages = [ 'English', ...faker.random.arrayElements(commonLanguages, faker.datatype.number({ min: 1, max: 1 })) ];
        const vehicleRestriction = faker.random.arrayElement(aircrafts); // Adjust as needed
        const seniorityLevel = faker.random.arrayElement(["Senior", "Junior", "Trainee"]);
    
        return new Pilot(pilotId, name, age, gender, nationality, languages, vehicleRestriction, seniorityLevel);
    }


    toString() {
        return JSON.stringify(this);
    }
    
}

module.exports = { Pilot};



