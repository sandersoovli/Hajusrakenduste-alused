const express = require('express');
const cors = require('cors');
const axios = require('axios'); // LISA SEE

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

// --- 1. LISA: Middleware klastrisiseseks valideerimiseks ---
const verifyTokenWithAuthService = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Autoriseerimata vaade: Token puudub' });
  }

  try {
    // Kutsume auth-teenuse /auth/verify ruuterit
    await axios.post(
      'http://auth-srv:5006/auth/verify',
      {},
      { headers: { Authorization: authHeader } }
    );
    next();
  } catch (err) {
    console.error('Päring lükati tagasi:', err.message);
    return res.status(401).json({ message: 'Autoriseerimata vaade: Vigane token' });
  }
};

const posts = {};

const handleEvent = (type, data) => {
  // ... (Sinu olemasolev handleEvent loogika jääb samaks)
  console.log('Handling event:', type, data);
  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }
  // ... (ülejäänud sündmused)
};

// --- 2. MUUDA: Turva andmete lugemise ruuter ---
app.get('/posts', verifyTokenWithAuthService, (req, res) => {
  res.json(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(5002, '0.0.0.0', () => {
  console.log('Query service running on http://0.0.0.0:5002');
});