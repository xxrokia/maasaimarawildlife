import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Button, Form, ListGroup } from 'react-bootstrap';
import './ChatComponent.css'; // Ensure this file exists and contains the styles

const socket = io('http://localhost:4000'); // Ensure this matches your server address

const predefinedQuestions = {
    'What is the Maasai Mara?': 'The Maasai Mara is a large game reserve in Narok County, Kenya. It is known for its incredible wildlife and is part of the larger Serengeti ecosystem.',
    'How do I track animals in the app?': 'To track animals, use the interactive map on our dashboard to view real-time locations and paths of various wildlife.',
    'What features does the app have?': 'Our app features real-time tracking, an interactive map with animal paths, and detailed statistics and reports on wildlife.',
    'Can I see historical data on animal movements?': 'Yes, our app provides historical data on animal movements and environmental factors for analysis.',
    'How can I get help with the app?': 'You can contact our support team through the contact form available in the app or visit our help section for more information.',
    'What animals can I track with this app?': 'Our app allows you to track a variety of animals including lions, elephants, giraffes, zebras, and more.',
    'Is there a mobile version of the app?': 'Currently, our app is available only on desktop. However, we are working on a mobile version for future release.',
    'How often is the animal data updated?': 'Animal data is updated in real-time, allowing you to track movements as they happen.',
    'Can I customize the map view?': 'Yes, you can customize the map view by selecting different layers and filters according to your preferences.',
    'Is there a user guide available?': 'Yes, a comprehensive user guide is available in the help section of the app.',
    'How do I report an issue with the app?': 'To report an issue, use the feedback form in the app or contact our support team directly.',
    'Are there any tutorials on how to use the app?': 'Yes, we offer video tutorials and written guides in the help section of the app.',
    'Can I share animal tracking data with others?': 'Yes, you can share tracking data by exporting reports and maps or using the sharing options within the app.',
    'What types of reports can I generate?': 'You can generate various reports including movement patterns, population estimates, and environmental impact analyses.',
    'How do I reset my password?': 'To reset your password, go to the login page and click on "Forgot Password" to receive instructions via email.',
    'Is my data secure with this app?': 'Yes, we implement strong security measures to protect your data and ensure your privacy.',
    'Can I track animals from other reserves?': 'Currently, our app is focused on the Maasai Mara, but we are exploring the possibility of expanding to other reserves in the future.',
    'What is the best way to interpret animal movement data?': 'We provide detailed analytics and visualizations to help you interpret movement data effectively. Refer to our guides for more information.',
    'How do I contact the research team?': 'You can contact our research team through the contact form in the app or by emailing research@maasaimara.com.',
    'Are there any plans for new features?': 'Yes, we are constantly working on adding new features and improvements based on user feedback and technological advancements.',
    'How can I provide feedback about the app?': 'You can provide feedback through the feedback form available in the app or contact us directly at feedback@maasaimara.com.',
    'What is the mission of the Maasai Mara Wildlife Tracking Dashboard?': 'Our mission is to enhance wildlife conservation efforts by providing real-time tracking and detailed analytics of animal movements in the Maasai Mara.'
  };
  

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    // Scroll to the latest message
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });

    socket.on('chatMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chatMessage'); // Clean up the listener on component unmount
    };
  }, []);

  const handleSendMessage = () => {
    if (input.trim()) {
      // Add user message
      setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: input }]);

      // Respond with predefined answer
      const response = predefinedQuestions[input.trim()] || 'Sorry, I don\'t understand that question.';

      // Simulate chatbot response
      setMessages((prevMessages) => [...prevMessages, { sender: 'chatbot', text: response }]);

      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat with Us</div>
      <div className="chat-box">
        <ListGroup>
          {messages.map((msg, index) => (
            <ListGroup.Item
              key={index}
              className={`chat-message ${msg.sender === 'chatbot' ? 'chatbot-message' : 'user-message'}`}
            >
              {msg.text}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div ref={endOfMessagesRef} />
      </div>
      <Form.Group className="chat-input">
        <Form.Control
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button variant="primary" onClick={handleSendMessage}>Send</Button>
      </Form.Group>
    </div>
  );
};

const apiKey = process.env.REACT_APP_API_KEY; // Access the API key from environment variables

console.log('API Key:', apiKey); // Log to ensure it's being accessed correctly

export default ChatComponent;
