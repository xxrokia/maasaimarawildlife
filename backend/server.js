const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 4000;
const mongoURI = 'mongodb://localhost:27017/maasai_mara';
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// MongoDB Schemas
const Animal = mongoose.model('Animal', {
  species: String,
  age: Number,
  latitude: Number,
  longitude: Number,
  speed: Number,
  distance_traveled: Number
});

const Statistics = mongoose.model('Statistics', {
  totalDistance: Number,
  averageSpeed: Number,
  totalAnimals: Number
});

const Terrain = mongoose.model('Terrain', {
  type: String,
  latitude: Number,
  longitude: Number
});

const Weather = mongoose.model('Weather', {
  condition: String,
  temperature: Number,
  latitude: Number,
  longitude: Number
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Function to call OpenAI API
const getChatGPTResponse = async (message) => {
  const prompt = `You are an expert on Maasai Mara wildlife. Answer the following questions about animals in the Maasai Mara and related facts: ${message}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error fetching response from ChatGPT:', error);
    return 'Sorry, something went wrong.';
  }
};

// Socket.io connection for chat
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chatMessage', async (msg) => {
    console.log('Received message:', msg);

    // Emit the user message to all clients
    io.emit('chatMessage', { text: msg, sender: 'user' });

    // Get response from ChatGPT
    const chatGPTResponse = await getChatGPTResponse(msg);

    console.log('ChatGPT response:', chatGPTResponse);

    // Emit the ChatGPT response to all clients
    io.emit('chatMessage', { text: chatGPTResponse, sender: 'chatbot' });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.get('/animals', async (req, res) => {
  try {
    const animals = await Animal.find();
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});
