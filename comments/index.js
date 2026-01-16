const express = require('express');
const { randomBytes } = require('node:crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://blog.local",
  "http://blog.local",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));

// 1. LISA: Middleware tokeni kontrollimiseks (Täpselt sama mis posts teenuses)
const verifyTokenWithAuthService = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  try {
    await axios.post(
      'http://auth-srv:5006/auth/verify',
      {},
      { headers: { Authorization: authHeader } }
    );
    next();
  } catch (err) {
    // Logime vea terminali, et näeksid kui klastrisisene ühendus ei toimi
    console.error('Auth check failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const commentsByPostId = {};

// 2. LISA: Turva kommentaaride lugemine (valikuline, aga ülesande järgi soovituslik)
app.get('/posts/:id/comments', verifyTokenWithAuthService, (req, res) => {
  res.json(commentsByPostId[req.params.id] || []);
});

// 3. LISA: Turva kommentaari loomine (KOHUSTUSLIK vastavalt ülesandele)
app.post('/posts/:id/comments', verifyTokenWithAuthService, async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;
  const postId = req.params.id;

  const comments = commentsByPostId[postId] || [];
  const comment = { id: commentId, content, status: 'pending' };
  comments.push(comment);
  commentsByPostId[postId] = comments;

  try {
    await axios.post('http://event-bus-srv:5005/events', {
      type: 'CommentCreated',
      data: { id: commentId, content, postId, status: 'pending' },
    });
  } catch (err) {
    console.log('Error emitting CommentCreated event:', err.message);
  }

  res.status(201).json(comments);
});

// Event listener jääb samaks (seda ei turvata JWT-ga, sest see on klastrisisene liiklus)
app.post('/events', async (req, res) => {
  // ... (olemasolev kood jääb muutmata)
  res.send({});
});

app.listen(5001, '0.0.0.0', () => {
  console.log('Comments service running on http://0.0.0.0:5001');
});