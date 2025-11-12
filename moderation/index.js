const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'CommentCreated') {
        const { id, content, postId } = data;
        const status = content.includes('orange') ? 'rejected' : 'approved';

        try {
            await axios.post('http://event-bus:5005/events', {
                type: 'CommentModerated',
                data: { id, postId, status, content }
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
