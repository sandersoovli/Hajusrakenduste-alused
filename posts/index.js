const express = require('express');
const { randomBytes } = require('node:crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const posts = [];

app.get('/', (req, res) => {
  res.send('Posts service running!');
});

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const title = req.body.title;
  const post = { id, title };
  posts.push(post);

  try {
    await axios.post('http://event-bus:5005/events', {
      type: 'PostCreated',
      data: post,
    });
  } catch (err) {
    console.log('Error emitting event to event bus:', err.message);
  }

  res.status(201).json(post);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    posts.push(data);
  }

  console.log('Received Event:', req.body);
  res.send({});
});

app.listen(3001, () => {
  console.log('Posts service running on http://localhost:3001');
});
