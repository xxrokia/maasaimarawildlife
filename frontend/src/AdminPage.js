import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
// import './AdminPage.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [backupSchedule, setBackupSchedule] = useState('');

  useEffect(() => {
    // Fetch users from the backend
    axios.get('/api/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(users.find(user => user._id === userId));
  };

  const handleBackupScheduleChange = (e) => {
    setBackupSchedule(e.target.value);
  };

  const scheduleBackup = () => {
    // Schedule a backup using the provided schedule
    console.log('Backup scheduled:', backupSchedule);
  };

  return (
    <Container>
      <Row>
        <Col md={6}>
          <h3>Manage Users</h3>
          <Form>
            <Form.Group controlId="userSelect">
              <Form.Label>Select User</Form.Label>
              <Form.Control as="select" onChange={handleUserChange}>
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
          {selectedUser && (
            <div>
              <h4>User Details</h4>
              <p>Name: {selectedUser.name}</p>
              <p>Email: {selectedUser.email}</p>
              {/* Add more user details as needed */}
            </div>
          )}
        </Col>
        <Col md={6}>
          <h3>Configure System Settings</h3>
          <Form>
            <Form.Group controlId="backupSchedule">
              <Form.Label>Backup Schedule</Form.Label>
              <Form.Control
                type="text"
                value={backupSchedule}
                onChange={handleBackupScheduleChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={scheduleBackup}>
              Schedule Backup
            </Button>
          </Form>
          <h3 className="mt-4">Monitor System Security</h3>
          <p>Security monitoring tools and logs would be displayed here.</p>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminPage;
