const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const events = [];

app.post('/events', (req, res) =>{
    const event = req.body;
    events.push(event);

    console.log('Received Event:', event.type);

    // Saada sündmus Postituste teenusele
    axios.post('http://localhost:5000/events', event).catch((err) =>{
        console.log('Error forwarding event to posts service:', err.message);
    });

    // Saada sündmus Kommentaaride teenusele
    axios.post('http://localhost:5001/events', event).catch((err) =>{
        console.log('Error forwarding event to comments service:', err.message);
    });

    // UUS LISANDUS: Saada sündmus Query teenusele
    axios.post('http://localhost:5002/events', event).catch((err) =>{
        console.log('Error forwarding event to query service:', err.message);
    });


    res.json({ status: 'OK' });
});

app.get('/events', (req, res) =>{
    res.json(events);
});

app.listen(5005, () =>{
    console.log('event-bus  service running on http://localhost:5005');
});