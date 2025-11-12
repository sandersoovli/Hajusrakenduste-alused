const express = require('express');
const { randomBytes } = require('node:crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const commentsByPostId = {};

// Get comments for a post
app.get('/posts/:id/comments', (req, res) => {
  res.json(commentsByPostId[req.params.id] || []);
});

// Create a comment
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;
  const postId = req.params.id;

  const comments = commentsByPostId[postId] || [];
  const comment = { id: commentId, content, status: 'pending' };
  comments.push(comment);
  commentsByPostId[postId] = comments;

  try {
    await axios.post('http://event-bus:5005/events', {
      type: 'CommentCreated',
      data: { id: commentId, content, postId, status: 'pending' },
    });
  } catch (err) {
    console.log('Error emitting CommentCreated event:', err.message);
  }

  res.status(201).json(comments);
});

// Receive events from event bus
app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    commentsByPostId[data.id] = [];
  }

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;
    const comments = commentsByPostId[postId];
    if (!comments) return res.send({});

    const comment = comments.find((c) => c.id === id);
    if (!comment) return res.send({});

    comment.status = status;

    try {
      await axios.post('http://event-bus:5005/events', {
        type: 'CommentUpdated',
        data: { id, postId, status, content },
      });
    } catch (err) {
      console.log('Error emitting CommentUpdated event:', err.message);
    }
  }

  console.log('Received Event:', req.body);
  res.send({});
});

app.listen(5001, () => {
  console.log('Comments service running on http://localhost:5001');
});
