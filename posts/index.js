const express = require('express');
const { randomBytes } = require('node:crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());

const allowedOrigins = ["https://blog.local", "http://blog.local", "http://localhost:3000"];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// --- JWT middleware ---
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
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const posts = [];
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Posts service running!');
});

// --- Kaitstud route ---
app.get('/posts', verifyTokenWithAuthService, (req, res) => {
  res.json(posts);
});

// --- Create post ---
const createPost = async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const title = req.body.title;
  const post = { id, title, comments: [] };
  posts.push(post);

  try {
    await axios.post('http://event-bus-srv:5005/events', { type: 'PostCreated', data: post });
  } catch (err) {
    console.log('Error emitting event to event bus:', err.message);
  }

  res.status(201).json(post);
};

app.post('/posts', verifyTokenWithAuthService, createPost);
app.post('/posts/create', verifyTokenWithAuthService,createPost);

// --- Event listener ---
app.post('/events', (req, res) => {
  const { type, data } = req.body;
  if (type === 'PostCreated') posts.push(data);
  console.log('Received Event:', req.body);
  res.send({});
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
