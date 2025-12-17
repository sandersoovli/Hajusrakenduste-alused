const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const events = [];

app.post('/events', (req, res) => {
  const event = req.body;
  events.push(event);

  console.log('Received Event:', event.type);

  // Saada sündmus teenustele õige DNS ja portiga
  axios.post('http://posts-srv:5000/events', event)
    .then(() => console.log('Event sent to posts'))
    .catch(err => console.log('Error forwarding event to posts service:', err.message));

  axios.post('http://comments-srv:5001/events', event)
    .then(() => console.log('Event sent to comments'))
    .catch(err => console.log('Error forwarding event to comments service:', err.message));

  axios.post('http://query-srv:5002/events', event)
    .then(() => console.log('Event sent to query'))
    .catch(err => console.log('Error forwarding event to query service:', err.message));

  axios.post('http://moderation-srv:5003/events', event)
    .then(() => console.log('Event sent to moderation'))
    .catch(err => console.log('Error forwarding event to moderation service:', err.message));

  res.json({ status: 'OK' });
});

app.get('/events', (req, res) => {
  res.json(events);
});

// Kuulamine 0.0.0.0, et Kubernetes saaks ühenduda
app.listen(5005, '0.0.0.0', () => {
  console.log('Event-bus service running on http://0.0.0.0:5005');
});
