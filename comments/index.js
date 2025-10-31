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

  // Emit CommentCreated event to the event bus
  try {
    await axios.post('http://localhost:5005/events', {
      type: 'CommentCreated',
      data: {
        id: commentId,
        content,
        postId,
        status: 'pending'
      }
    });
  } catch (err) {
    console.log('Error emitting CommentCreated event:', err.message);
  }

  res.status(201).json(comments);
});

// Receive events from the event bus
app.post('/events', async (req, res) => { // TEEME FUNKTSIOONI ASÜNKROONSEKS
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    commentsByPostId[data.id] = [];
  } 
  
  // UUS KÄITLEMINE: Kui kommentaar on modereeritud
  if (type === 'CommentModerated') {
      const { id, postId, status, content } = data;
      const comments = commentsByPostId[postId];
      if (!comments) return res.send({});

      const comment = comments.find(c => c.id === id);
      if (!comment) return res.send({});
      
      // Muuda staatus
      comment.status = status; 
      
      // Saada Event Bus'i teavitus CommentUpdated
      try {
          await axios.post('http://localhost:5005/events', {
              type: 'CommentUpdated',
              data: {
                  id,
                  postId,
                  status,
                  content // Saada sisu uuesti kaasa
              }
          });
      } catch (err) {
          console.log('Error emitting CommentUpdated event:', err.message);
      }
  }
  console.log('Received Event:', req.body);

  res.send({});
});

// Replay past events on startup to initialize commentsByPostId
const start = async () => {
  try {
    const res = await axios.get('http://localhost:5005/events');
    const events = res.data;

    for (let event of events) {
      if (event.type === 'PostCreated') {
        commentsByPostId[event.data.id] = [];
      }
    }

    app.listen(5001, () => {
      console.log('Comments service running on http://localhost:5001');
    });
  } catch (err) {
    console.log('Error fetching events on startup:', err.message);
  }
};

start();
