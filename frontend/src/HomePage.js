// src/HomePage.js
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container>
      <Row>
        <Col className="text-center">
          <h1>Welcome to the Maasai Mara Wildlife Tracking Dashboard</h1>
          <p>Discover and track wildlife in the Maasai Mara National Reserve.</p>
          <Link to="/login">
            <Button variant="primary" className="m-2">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary" className="m-2">Sign Up</Button>
          </Link>
          <h3>Our Services</h3>
          <ul>
            <li>Real-time tracking of wildlife</li>
            <li>Interactive map with animal paths</li>
            <li>Detailed statistics and reports</li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
