import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, Polyline } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'leaflet-arrowheads';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import L from 'leaflet';
import './App.css';



// Import animal icons
import lionIcon from './icons/lion.png';
import elephantIcon from './icons/elephant.png';
import zebraIcon from './icons/zebra.png';
import giraffeIcon from './icons/giraffe.png';
import gazelleIcon from './icons/gazelle.png';
import cheetahIcon from './icons/cheetah.png';
import buffaloIcon from './icons/buffalo.png';
import hippoIcon from './icons/hippo.png';
import wildebeestIcon from './icons/wildebeest.png';
import leopardIcon from './icons/leopard.png';

// Import Chat Component
import ChatComponent from './ChatComponent';
import AdminPage from './AdminPage';
import ResearcherPage from './ResearcherPage';

// Define custom icons for each animal species
const animalIcons = {
  lion: lionIcon,
  elephant: elephantIcon,
  zebra: zebraIcon,
  giraffe: giraffeIcon,
  gazelle: gazelleIcon,
  cheetah: cheetahIcon,
  buffalo: buffaloIcon,
  hippo: hippoIcon,
  wildebeest: wildebeestIcon,
  leopard: leopardIcon
};




function createIcon(iconUrl, size, isBlinking, isSelected) {
  return new L.Icon({
    iconUrl,
    iconSize: [size, size * 1.64],
    iconAnchor: [size / 2, size * 1.64],
    popupAnchor: [0, -size * 1.64],
    className: `${isBlinking ? 'blinking-icon' : ''} ${isSelected ? 'selected-icon' : ''}`
  });
}

function formatCoordinates(latitude, longitude) {
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lngDirection = longitude >= 0 ? 'E' : 'W';
  const latFormatted = Math.abs(latitude).toFixed(4);
  const lngFormatted = Math.abs(longitude).toFixed(4);
  return `${latFormatted}° ${latDirection}, ${lngFormatted}° ${lngDirection}`;
}

function App() {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [filter, setFilter] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    drawLinesSelected: false,
    iconBlinking: false,
    iconSize: 'Intermediate',
    colorSchema: 'Pink/Blue',
    mapType: 'Terrain'
  });
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [animalPaths, setAnimalPaths] = useState({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [statistics, setStatistics] = useState({
    totalDistance: 0,
    averageSpeed: 0,
    totalAnimals: 0
  });
  const [socket, setSocket] = useState(null); // State for WebSocket connection


  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('animalData', (data) => {
      setAnimals(data);
      setFilteredAnimals(data);
      updateStatistics(data);
    });

    fetchAnimals();

    return () => {
      newSocket.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let interval;
    if (options.iconBlinking && isPlaying) {
      interval = setInterval(() => {
        setAnimals(prevAnimals => {
          return prevAnimals.map(animal => {
            // Simulate movement
            const newLatitude = animal.latitude + (Math.random() - 0.5) * 0.01;
            const newLongitude = animal.longitude + (Math.random() - 0.5) * 0.01;
            return {
              ...animal,
              latitude: newLatitude,
              longitude: newLongitude,
            };
          });
        });
      }, 5000); // Update every 5 seconds
    }

    return () => clearInterval(interval);
  }, [options.iconBlinking, isPlaying]);

  const fetchAnimals = async () => {
    try {
      const response = await fetch('http://localhost:4000/animals');
      if (!response.ok) {
        throw new Error('Failed to fetch animals');
      }
      const data = await response.json();
      setAnimals(data);
      setFilteredAnimals(data);
      updateStatistics(data);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const handleSearch = () => {
    if (filter) {
      const filtered = animals.filter(animal => 
        animal.species && animal.species.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredAnimals(filtered);
      setSelectedAnimals(filtered);
      updateStatistics(filtered);
    } else {
      setFilteredAnimals(animals);
      setSelectedAnimals([]);
      updateStatistics(animals);
    }
  };

  const handleOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePlayback = () => {
    setIsPlaying(prevIsPlaying => {
      const newPlayingState = !prevIsPlaying;
      if (newPlayingState) {
        socket.connect();
      } else {
        socket.disconnect();
      }
      return newPlayingState;
    });
  };

  const updateStatistics = (animalData) => {
    const totalDistance = animalData.reduce((sum, animal) => sum + animal.distance_traveled, 0);
    const averageSpeed = animalData.reduce((sum, animal) => sum + animal.speed, 0) / animalData.length;
    const totalAnimals = animalData.length;

    setStatistics({
      totalDistance,
      averageSpeed,
      totalAnimals
    });
  };

  const handleCreated = (e) => {
    console.log('Shape created:', e);
  };

  const getIconSize = () => {
    switch (options.iconSize) {
      case 'Small':
        return 16;
      case 'Intermediate':
        return 25;
      case 'Large':
        return 40;
      default:
        return 25;
    }
  };

  const getColor = () => {
    switch (options.colorSchema) {
      case 'Pink/Blue':
        return ['#FF69B4', '#1E90FF']; // Pink and Blue
      case 'Black/Orange':
        return ['#000000', '#FFA500']; // Black and Orange
      default:
        return ['#FF69B4', '#1E90FF']; // Default to Pink and Blue
    }
  };

  const iconSize = getIconSize();
  const [color1, ] = getColor();

  const showPath = (animal) => {
    setSelectedAnimals(prevSelectedAnimals => {
      const isAlreadySelected = prevSelectedAnimals.some(selectedAnimal => selectedAnimal._id === animal._id);
      if (isAlreadySelected) {
        const updatedPaths = { ...animalPaths };
        delete updatedPaths[animal._id];
        setAnimalPaths(updatedPaths);
        return prevSelectedAnimals.filter(selectedAnimal => selectedAnimal._id !== animal._id);
      } else {
        const updatedPaths = { ...animalPaths, [animal._id]: animal.path || [] };
        setAnimalPaths(updatedPaths);
        return [...prevSelectedAnimals, animal];
      }
    });
  };

  const tileLayerUrl = options.mapType === 'Terrain'
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmFuY3lyb2tpYSIsImEiOiJjbHlycmw0NHYwOXVoMnJzMXQ3djdmM3d1In0.VAKh3miSMP8jps_7jltwTQ';

  return (
    
    <div className="App">
      <Container fluid>
        <Row>
          <Col md={3}>
          <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/researcher" element={<ResearcherPage />} />
      </Routes>
    </Router>

            <h3>Animal Tracking Dashboard</h3>
            <Form.Group controlId="filter">
              <Form.Label>Filter by Species</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Enter species"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <Button variant="primary" onClick={handleSearch} className="ml-2">Search</Button>
              </div>
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button variant="primary" onClick={() => setShowOptions(!showOptions)}>Options</Button>
              <Button variant="primary" onClick={togglePlayback}>
                {isPlaying ? 'Pause' : 'Resume'}
              </Button>
            </div>
            {showOptions && (
              <div className="options-menu">
                <label>
                  <input
                    type="checkbox"
                    name="drawLinesSelected"
                    checked={options.drawLinesSelected}
                    onChange={handleOptionsChange}
                  />
                  Draw lines for selected animals
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="iconBlinking"
                    checked={options.iconBlinking}
                    onChange={handleOptionsChange}
                  />
                  Icon blinking for selected animals
                </label>
                <div>
                  Icon Size
                  <label>
                    <input
                      type="radio"
                      name="iconSize"
                      value="Small"
                      checked={options.iconSize === 'Small'}
                      onChange={handleOptionsChange}
                    />
                    Small
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="iconSize"
                      value="Intermediate"
                      checked={options.iconSize === 'Intermediate'}
                      onChange={handleOptionsChange}
                    />
                    Intermediate
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="iconSize"
                      value="Large"
                      checked={options.iconSize === 'Large'}
                      onChange={handleOptionsChange}
                    />
                    Large
                  </label>
                </div>
                <div>
                  Color Schema
                  <label>
                    <input
                      type="radio"
                      name="colorSchema"
                      value="Pink/Blue"
                      checked={options.colorSchema === 'Pink/Blue'}
                      onChange={handleOptionsChange}
                    />
                    Pink/Blue
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="colorSchema"
                      value="Black/Orange"
                      checked={options.colorSchema === 'Black/Orange'}
                      onChange={handleOptionsChange}
                    />
                    Black/Orange
                  </label>
                </div>
                <div>
                  Map Type
                  <label>
                    <input
                      type="radio"
                      name="mapType"
                      value="Terrain"
                      checked={options.mapType === 'Terrain'}
                      onChange={handleOptionsChange}
                    />
                    Terrain
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="mapType"
                      value="Satellite"
                      checked={options.mapType === 'Satellite'}
                      onChange={handleOptionsChange}
                    />
                    Satellite
                  </label>
                </div>
              </div>
            )}
            <div className="statistics">
              <h4>Statistics</h4>
              <p>Total Distance: {statistics.totalDistance.toFixed(2)} km</p>
              <p>Average Speed: {statistics.averageSpeed.toFixed(2)} km/h</p>
              <p>Total Animals: {statistics.totalAnimals}</p>
            </div>
            <ChatComponent />
          </Col>
          <Col md={9}>
            <MapContainer center={[-1.406, 35.014]} zoom={10} style={{ height: '100vh' }}>
              <TileLayer url={tileLayerUrl} />
              <FeatureGroup>
                <EditControl position="topright" onCreated={handleCreated} />
              </FeatureGroup>
              {filteredAnimals.map((animal) => (
                <Marker
                  key={animal._id}
                  position={[animal.latitude, animal.longitude]}
                  icon={createIcon(animalIcons[animal.species], iconSize, options.iconBlinking && selectedAnimals.some(selected => selected._id === animal._id), selectedAnimals.some(selected => selected._id === animal._id))}
                  eventHandlers={{
                    click: () => showPath(animal),
                  }}
                >
                  <Popup>
                    <div>
                      <h5>{animal.species}</h5>
                      <strong>Coordinates:</strong> {formatCoordinates(animal.latitude, animal.longitude)}
                      <p>Age: {animal.age}</p>
                      <p>Speed: {animal.speed.toFixed(2)} km/h</p>
                      <p>Distance Traveled: {animal.distance_traveled.toFixed(2)} km</p>
                      <Button variant="primary" onClick={() => showPath(animal)}>Show Path</Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {Object.keys(animalPaths).map(animalId => (
                <Polyline
                  key={animalId}
                  positions={animalPaths[animalId]}
                  color="black"
                  weight={3}
                />
              ))}
              {options.drawLinesSelected && selectedAnimals.length > 0 && (
                <Polyline
                  positions={selectedAnimals.map((animal) => [animal.latitude, animal.longitude])}
                  color={color1}
                  weight={3}
                />
              )}
            </MapContainer>
          </Col>
        </Row>
      </Container>
      
    </div>
  );
}



export default App;