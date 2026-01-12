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

const posts = [];
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Posts service running!');
});

app.get('/posts', (req, res) => {
  res.json(posts);
});

const createPost = async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const title = req.body.title;
  const post = { id, title };
  posts.push(post);

  try {
    await axios.post('http://event-bus-srv:5005/events', {
      type: 'PostCreated',
      data: post,
    });
  } catch (err) {
    console.log('Error emitting event to event bus:', err.message);
  }

  res.status(201).json(post);
};

// Support original path
app.post('/posts', createPost);
// Support ingress-routed create path
app.post('/posts/create', createPost);

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    posts.push(data);
  }

  console.log('Received Event:', req.body);
  res.send({});
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
