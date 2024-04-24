from supabase import create_client
from dotenv import load_dotenv
import os 
from faker import Faker
import random

load_dotenv()

API_KEY = os.getenv('API_KEY')
API_URL = os.getenv('API_URL')

supabase = create_client(API_URL, API_KEY)
supabase



fake = Faker()

def generate_flight_number():
    # Generate a flight number in the AANNNN format (e.g., XX1234)
    return "XX" + str(random.randint(1000, 9999))

def generate_passenger(parent_id=None):
    # If parent_id is given, it's an infant, so some fields will be ignored
    if parent_id:
        return {
            "passengerid": random.randint(1, 10000),  # Example range for ID
            "flightnum": generate_flight_number(),
            "name": fake.name(),
            "age": random.randint(0, 2),  # Age range for infants
            "gender": random.choice(["Male", "Female", "Other"]),
            "nationality": fake.country(),
            "seattype": None,
            "seatnumber": None,
            "parentid": parent_id
        }
    else:
        # Generate data for a regular passenger
        age = random.randint(3, 100)
        return {
            "passengerid": random.randint(1, 10000),
            "flightnum": generate_flight_number(),
            "name": fake.name(),
            "age": age,
            "gender": random.choice(["Male", "Female", "Other"]),
            "nationality": fake.country(),
            "seattype": random.choice(["Economy", "Business"]),
            "seatnumber": None if age <= 2 else f"{random.choice(['A', 'B', 'C', 'D', 'E', 'F'])}{random.randint(1, 30)}",
            "parentid": None
        }

# Example: Generate 10 passengers
passengers = [generate_passenger() for _ in range(10)]

# Generate an infant with a parent from the list
parent = random.choice(passengers)
infant = generate_passenger(parent_id=parent["passengerid"])

print("Sample Generated Passenger:")
for p in passengers + [infant]:
    print(p)
