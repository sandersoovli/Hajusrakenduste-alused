const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // või http://localhost:3000

app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'CommentCreated') {
        const { id, content, postId } = data;
        const status = content.includes('orange') ? 'rejected' : 'approved';

        try {
            await axios.post('http://event-bus-srv:5005/events', {
                type: 'CommentModerated',
                data: { id, postId, status, content }
            });
            console.log(`CommentModerated event sent for commentId=${id}`);
        } catch (err) {
            console.error('Error emitting CommentModerated event:', err.message);
        }
    }

    res.send({});
});

const PORT = 5003;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Moderation service running on http://0.0.0.0:${PORT}`);
});
