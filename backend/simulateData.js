const { MongoClient } = require('mongodb');
const { DateTime } = require('luxon');

// Define simulation parameters
const start_date = DateTime.fromObject({ year: 2024, month: 7, day: 1, hour: 8, minute: 0, second: 0 }); // Start from 8 AM, July 1st, 2024
const end_date = start_date.plus({ days: 1 }); // Simulate data for 24 hours
const interval = { seconds: 5 }; // Interval between data points

// MongoDB connection setup
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'maasai_mara';
const collectionName = 'animals';

// Helper function to generate random number within range
function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

async function simulateData() {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // Fetch animals data from MongoDB
    const animals = await collection.find({}).toArray();

    // Simulate data collection
    let simulated_data = [];

    let current_time = start_date;
    while (current_time < end_date) {
      for (let animal of animals) {
        // Simulate movement based on speed and direction (random for simplicity)
        let latitude = animal.latitude + getRandomInRange(-0.01, 0.01);  // Simulate slight variation
        let longitude = animal.longitude + getRandomInRange(-0.01, 0.01);

        // Simulate speed variation (slight changes over time)
        let speed_variation = getRandomInRange(-0.5, 0.5);
        let speed = Math.max(1, Math.min(animal.speed + speed_variation, 15));  // Limit speed between 1 and 15

        // Simulate distance traveled based on speed (for simplicity)
        let distance_traveled = animal.distance_traveled + speed;

        // Store simulated data point
        let data_point = {
          timestamp: current_time.toJSDate(),
          species: animal.species,
          age: animal.age,
          latitude: latitude,
          longitude: longitude,
          speed: speed,
          distance_traveled: distance_traveled,
          terrain_type: animal.terrain_type,
          weather_condition: animal.weather_condition
        };
        simulated_data.push(data_point);
      }

      // Move to the next time interval (e.g., 5 seconds simulation)
      current_time = current_time.plus(interval);
    }

    // Print or save simulated_data to use for training machine learning models
    console.log(simulated_data);

  } catch (error) {
    console.error('Error during simulation:', error);
  } finally {
    await client.close();
  }
}

// Run simulation
simulateData();

module.exports = simulateData;
