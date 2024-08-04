const { MongoClient } = require('mongodb');
const { DateTime } = require('luxon');
const fs = require('fs');

// Define simulation parameters
const start_date = DateTime.fromObject({ year: 2024, month: 7, day: 1, hour: 8, minute: 0, second: 0 }); // Start from 8 AM, July 1st, 2024
const end_date = start_date.plus({ days: 1 }); // Simulate data for 24 hours
const interval = { seconds: 5 }; // Interval between data points

// MongoDB connection setup
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'maasai_mara';
const collectionName = 'animals';

// Helper function to generate random number within range
function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Save simulated data to JSON
function saveToJSON(data) {
  fs.writeFileSync('simulated_data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error writing JSON file', err);
    } else {
      console.log('JSON file saved successfully');
    }
  });
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
    while (current_time <= end_date) {
      const timestamp = current_time.toJSDate();
      
      for (let animal of animals) {
        const new_latitude = animal.latitude + getRandomInRange(-0.05, 0.05);
        const new_longitude = animal.longitude + getRandomInRange(-0.05, 0.05);
        const new_speed = getRandomInRange(0, 10);
        const new_distance_traveled = animal.distance_traveled + new_speed * (interval.minutes / 60); // Distance = speed * time
        
        // Update animal data in MongoDB
        await collection.updateOne(
          { _id: animal._id },
          {
            $set: {
              latitude: new_latitude,
              longitude: new_longitude,
              speed: new_speed,
              distance_traveled: new_distance_traveled
            },
            $push: { // Append to the movements history array
              movements_history: {
                timestamp,
                latitude: new_latitude,
                longitude: new_longitude,
                speed: new_speed,
                distance_traveled: new_distance_traveled
              }
            }
          }
        );

        simulated_data.push({
          animal_id: animal._id,
          timestamp,
          latitude: new_latitude,
          longitude: new_longitude,
          speed: new_speed,
          distance_traveled: new_distance_traveled,
          terrain_type: animal.terrain_type,
          weather_condition: animal.weather_condition
        });
      }

      // Move to the next time interval
      current_time = current_time.plus(interval);
    }

    console.log(`Simulation completed for ${simulated_data.length} data points.`);
    saveToJSON(simulated_data);
  } catch (error) {
    console.error('Error occurred during simulation:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the simulation
simulateData();
