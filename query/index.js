const express = require('express');
const cors = require('cors');

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

const posts = {};

const handleEvent = (type, data) => {
  console.log('Handling event:', type, data);

  if (type === 'PostCreated') {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];

    if (!post) {
      console.warn(`Warning: Post not found for CommentCreated event. postId=${postId}`);
      return;
    }

    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];

    if (!post) {
      console.warn(`Warning: Post not found for CommentUpdated event. postId=${postId}`);
      return;
    }

    const comment = post.comments.find((c) => c.id === id);
    if (!comment) {
      console.warn(`Warning: Comment not found for CommentUpdated event. commentId=${id}`);
      return;
    }

    comment.content = content;
    comment.status = status;
  }
};

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  console.log('Received Event by Query Service:', req.body);
  res.send({});
});

app.listen(5002, '0.0.0.0', () => {
  console.log('Query service running on http://0.0.0.0:5002');
});
