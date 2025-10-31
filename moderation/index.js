const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Kuula sündmusbussilt
app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'CommentCreated') {
        const { id, content, postId } = data;

        // Modereerimisloogika: Kui kommentaar sisaldab sõna 'orange', lükka tagasi.
        const status = content.includes('orange') ? 'rejected' : 'approved';

        // Saada sündmus CommentModerated Event Bus'i
        try {
            await axios.post('http://localhost:5005/events', {
                type: 'CommentModerated',
                data: {
                    id,
                    postId,
                    status,
                    content
                }
            });
        } catch (err) {
            console.log('Error emitting CommentModerated event:', err.message);
        }
    }

    res.send({});
});

app.listen(5003, () => {
    console.log('Moderation service running on http://localhost:5003');
});