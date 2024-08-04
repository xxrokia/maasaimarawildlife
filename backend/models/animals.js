const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  species: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    required: true
  },
  distance_traveled: {
    type: Number,
    required: true
  },
  movements_history: [{
    latitude: Number,
    longitude: Number,
    speed: Number,
    distance_traveled: Number,
    timestamp: Date,
    terrain_type: String,
    weather_condition: String
  }],
  terrain_type: {
    type: String,
    required: true
  },
  weather_condition: {
    type: String,
    required: true
  }
});

const Animal = mongoose.model('Animal', animalSchema);

module.exports = Animal;
