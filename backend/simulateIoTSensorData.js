const Animal = require('./models/animals'); // Adjust filename as necessary

const simulateIoTSensorData = (io) => {
  setInterval(async () => {
    try {
      const animals = await Animal.find({});
      const updatedAnimals = animals.map(animal => {
        const deltaLat = (Math.random() - 0.5) * 0.01;
        const deltaLong = (Math.random() - 0.5) * 0.01;

        animal.latitude += deltaLat;
        animal.longitude += deltaLong;

        // Ensure animals stay within Maasai Mara boundaries
        if (animal.latitude < -1.5363 || animal.latitude > -1.2921 ||
            animal.longitude < 34.9075 || animal.longitude > 37.5344) {
          animal.latitude -= deltaLat; // Revert latitude change
          animal.longitude -= deltaLong; // Revert longitude change
        }

        animal.speed = Math.random() * 10; // Update speed for simulation
        animal.distance_traveled += animal.speed / 3600; // Distance in km

        // Add to movements history
        animal.movements_history.push({
          latitude: animal.latitude,
          longitude: animal.longitude,
          speed: animal.speed,
          distance_traveled: animal.distance_traveled,
          timestamp: new Date(),
          terrain_type: animal.terrain_type,
          weather_condition: animal.weather_condition
        });

        // Limit the movements history to last 10 entries
        if (animal.movements_history.length > 10) {
          animal.movements_history.shift();
        }

        return animal.save();
      });

      io.emit('animalData', await Promise.all(updatedAnimals));
    } catch (error) {
      console.error('Error simulating IoT sensor data:', error);
    }
  }, 5000); // Update interval in milliseconds (e.g., every 5 seconds)
};

module.exports = simulateIoTSensorData;
