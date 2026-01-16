require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in .env!");
  process.exit(1);
}
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// --- Dummy user ---
const dummyUser = {
  id: '123',
  email: 'test@test.ee',
  role: 'user'
};

// --- Login route ---
app.post('/auth/login', (req, res) => {
  const { email } = req.body;

  // Kontrollime, et kasutaja oleks "dummy user"
  if (email !== dummyUser.email) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Loo JWT token
  const token = jwt.sign(
    { id: dummyUser.id, email: dummyUser.email, role: dummyUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ token });
});

// --- Verify route (posts/comments kasutavad seda) ---
app.post('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

// --- Server ---
const PORT = process.env.PORT || 5006;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth service running on http://0.0.0.0:${PORT}`);
});
