import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import './ResearcherPage.css';


function ResearcherPage() {
  const [simulations, setSimulations] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [report, setReport] = useState('');
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    // Fetch initial data for simulations and historical data
    fetchSimulations();
    fetchHistoricalData();
  }, []);

  const fetchSimulations = async () => {
    // Fetch simulations from the server
    const response = await fetch('http://localhost:4000/simulations');
    const data = await response.json();
    setSimulations(data);
  };

  const fetchHistoricalData = async () => {
    // Fetch historical data from the server
    const response = await fetch('http://localhost:4000/historical-data');
    const data = await response.json();
    setHistoricalData(data);
  };

  const handleSimulationChange = (e) => {
    const { name, value } = e.target;
    setSelectedSimulation((prevSimulation) => ({
      ...prevSimulation,
      [name]: value
    }));
  };

  const runSimulation = async () => {
    // Run simulation on the server
    await fetch('http://localhost:4000/simulations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedSimulation)
    });
    fetchSimulations();
  };

  const handleReportChange = (e) => {
    setReport(e.target.value);
  };

  const generateReport = async () => {
    // Generate report on the server
    await fetch('http://localhost:4000/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ report })
    });
  };

  const handleAnnotationChange = (e, index) => {
    const newAnnotations = annotations.slice();
    newAnnotations[index] = e.target.value;
    setAnnotations(newAnnotations);
  };

  const saveAnnotations = async () => {
    // Save annotations to the server
    await fetch('http://localhost:4000/annotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ annotations })
    });
  };

  return (
    <Container>
      <Row>
        <Col md={6}>
          <h3>Run Simulations</h3>
          <Form>
            <Form.Group controlId="simulationName">
            <Form.Label>Simulation Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={selectedSimulation?.name || ''}
                onChange={handleSimulationChange}
              />
            </Form.Group>
            <Form.Group controlId="parameters">
              <Form.Label>Parameters</Form.Label>
              <Form.Control
                type="text"
                name="parameters"
                value={selectedSimulation?.parameters || ''}
                onChange={handleSimulationChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={runSimulation}>
              Run Simulation
            </Button>
          </Form>
          <h3 className="mt-4">Simulations</h3>
          <ul>
            {simulations.map((simulation) => (
              <li key={simulation._id}>{simulation.name}</li>
            ))}
          </ul>
        </Col>
        <Col md={6}>
          <h3>Access Historical Data</h3>
          <ul>
            {historicalData.map((data) => (
              <li key={data._id}>{data.name}</li>
            ))}
          </ul>
          <h3 className="mt-4">Generate Reports</h3>
          <Form>
            <Form.Group controlId="report">
              <Form.Label>Report</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={report}
                onChange={handleReportChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={generateReport}>
              Generate Report
            </Button>
          </Form>
          <h3 className="mt-4">Annotate Data</h3>
          <Form>
            {annotations.map((annotation, index) => (
              <Form.Group controlId={`annotation-${index}`} key={index}>
                <Form.Label>Annotation {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={annotation}
                  onChange={(e) => handleAnnotationChange(e, index)}
                />
              </Form.Group>
            ))}
            <Button variant="primary" onClick={saveAnnotations}>
              Save Annotations
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default ResearcherPage;

