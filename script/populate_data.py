import pymongo
import random
import time
from datetime import datetime, timedelta

# MongoDB connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["maasai_mara"]
animals_collection = db["animals"]

# Define animal species and their counts
animal_species = {
    'lion': 50,
    'elephant': 100,
    'zebra': 75,
    'giraffe': 50,
    'gazelle': 50,
    'cheetah': 25,
    'buffalo': 25,
    'hippo': 25,
    'wildebeest': 75,
    'leopard': 25
}

# Clear existing data
animals_collection.delete_many({})
print("Cleared existing animal data.")

# Initial coordinates for animals within the reserve
initial_coordinates = {
    'lion': {'lat': -1.4067, 'lng': 35.1425},
    'elephant': {'lat': -1.5123, 'lng': 35.1311},
    'zebra': {'lat': -1.5204, 'lng': 35.1999},
    'giraffe': {'lat': -1.4325, 'lng': 35.1076},
    'gazelle': {'lat': -1.4823, 'lng': 35.1667},
    'cheetah': {'lat': -1.4556, 'lng': 35.1204},
    'buffalo': {'lat': -1.4012, 'lng': 35.0547},
    'hippo': {'lat': -1.4921, 'lng': 35.0289},
    'wildebeest': {'lat': -1.4712, 'lng': 35.0895},
    'leopard': {'lat': -1.4563, 'lng': 35.1207}
}

# Function to generate animal data
def generate_animal_data(species, base_lat, base_long, num, lat_range, long_range, speed_range, distance_range, age_range):
    animals = []
    for _ in range(num):
        lat = base_lat + random.uniform(-lat_range, lat_range)
        lng = base_long + random.uniform(-long_range, long_range)
        
        # Adjust terrain_type and weather_condition based on actual data or simulation
        if species in ['lion', 'giraffe', 'cheetah', 'buffalo', 'leopard']:
            terrain_type = "Savannah"
        elif species in ['elephant', 'zebra', 'gazelle', 'wildebeest']:
            terrain_type = "Grassland"
        elif species == 'hippo':
            terrain_type = "River"
        
        weather_condition = random.choice(["Sunny", "Cloudy", "Rainy"])  # Simulated weather conditions
        
        movements_history = []
        current_time = datetime.now()
        for _ in range(10):  # Assuming 10 movements per animal
            movement = {
                'latitude': lat + random.uniform(-0.01, 0.01),
                'longitude': lng + random.uniform(-0.01, 0.01),
                'speed': random.uniform(*speed_range),
                'distance_traveled': random.uniform(*distance_range),
                'timestamp': current_time.isoformat()
            }
            movements_history.append(movement)
            current_time += timedelta(hours=1)  # Incrementing time for each movement
        
        animal = {
            'species': species,
            'age': random.randint(*age_range),
            'latitude': lat,
            'longitude': lng,
            'speed': random.uniform(*speed_range),
            'distance_traveled': random.uniform(*distance_range),
            'terrain_type': terrain_type,
            'weather_condition': weather_condition,
            'movements_history': movements_history
        }
        animals.append(animal)
    return animals

# Define ranges for each species
lat_long_ranges = {
    "lion": (0.05, 0.05),
    "elephant": (0.1, 0.1),
    "zebra": (0.05, 0.05),
    "giraffe": (0.05, 0.05),
    "gazelle": (0.05, 0.05),
    "cheetah": (0.02, 0.02),
    "buffalo": (0.05, 0.05),
    "hippo": (0.02, 0.02),
    "wildebeest": (0.05, 0.05),
    "leopard": (0.02, 0.02)
}

speed_ranges = {
    "lion": (5, 8),
    "elephant": (3, 7),
    "zebra": (10, 14),
    "giraffe": (4, 7),
    "gazelle": (7, 10),
    "cheetah": (12, 15),
    "buffalo": (3, 5),
    "hippo": (2, 4),
    "wildebeest": (8, 12),
    "leopard": (10, 14)
}

distance_ranges = {
    "lion": (60, 100),
    "elephant": (50, 120),
    "zebra": (70, 150),
    "giraffe": (40, 90),
    "gazelle": (50, 120),
    "cheetah": (80, 200),
    "buffalo": (30, 80),
    "hippo": (20, 50),
    "wildebeest": (60, 140),
    "leopard": (70, 130)
}

age_ranges = {
    "lion": (3, 12),
    "elephant": (10, 60),
    "zebra": (2, 10),
    "giraffe": (5, 25),
    "gazelle": (2, 8),
    "cheetah": (3, 12),
    "buffalo": (5, 15),
    "hippo": (6, 20),
    "wildebeest": (2, 8),
    "leopard": (3, 10)
}

# Populate the animals collection
for species, count in animal_species.items():
    base_lat = initial_coordinates[species]['lat']
    base_long = initial_coordinates[species]['lng']
    lat_range, long_range = lat_long_ranges[species]
    speed_range = speed_ranges[species]
    distance_range = distance_ranges[species]
    age_range = age_ranges[species]
    
    animals = generate_animal_data(species, base_lat, base_long, count, lat_range, long_range, speed_range, distance_range, age_range)
    animals_collection.insert_many(animals)

print("Populated the 'animals' collection with sample data.")
