---
title: Comments Service
---
The Comments service manages comments for blog posts. It has the following functionalities:

1. Retrieve all comments for a post (`GET /posts/:id/comments`)

2. Create a comment for a post (`POST /posts/:id/comments`) and emit a `CommentCreated` event

3. Receive events from the Event Bus (`POST /events`) and react accordingly:

   - `PostCreated` → initialize empty comments for new post

   - `CommentModerated` → update comment status and emit `CommentUpdated` event

All comments are currently stored in memory in the `commentsByPostId` object.

1. Retrieve all comments for a post (`GET /posts/:id/comment`

<SwmSnippet path="/comments/index.js" line="13">

---

&nbsp;

```javascript
app.get('/posts/:id/comments', (req, res) => {
  res.json(commentsByPostId[req.params.id] || []);
});
```

---

</SwmSnippet>

2. Create a comment for a post (`POST /posts/:id/comments`) and emit a `CommentCreated` event

<SwmSnippet path="/comments/index.js" line="18">

---

&nbsp;

```javascript
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
```

---

</SwmSnippet>

3. Receive events from the Event Bus (`POST /events`) and react accordingly:

- `PostCreated` → initialize empty comments for new post

- `CommentModerated` → update comment status and emit `CommentUpdated` event

<SwmSnippet path="/comments/index.js" line="41">

---

&nbsp;

```javascript
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
```

---

</SwmSnippet>

### **Steps / How to Run and Test**

1. Navigate to the comments service folder:

```plaintext
cd comments

```

2. Install dependencies:

```plaintext
npm install

```

3. Start the service:

```plaintext
node index.js

```

4. Test endpoints:

**Get comments for a post:**

```plaintext
curl http://localhost:5001/posts/<POST_ID>/comments

```

**Create a comment:**

```plaintext
curl -X POST http://localhost:5001/posts/<POST_ID>/comments \
-H "Content-Type: application/json" \
-d '{"content":"My comment"}'

```

**Send an event manually (optional):**

```plaintext
curl -X POST http://localhost:5001/events \
-H "Content-Type: application/json" \
-d '{"type":"PostCreated","data":{"id":"abcd"}}'
```

**Explanation:**

- `Posts Service` emits `PostCreated` → `Comments Service` initializes comments for the new post.

- New comments emit `CommentCreated` → sent to Event Bus.

- Moderator service sends `CommentModerated` → `Comments Service` updates status and emits `CommentUpdated`.

- Frontend interacts with Comments Service via GET and POST endpoints.

### **Additional Information / Tips**

- Comments are stored in memory; restarting the service will clear them.

- Each new comment emits a `CommentCreated` event to the Event Bus.

- Comments can be moderated externally; `CommentModerated` events update the status.

- Logs show all received events for easier debugging.

- Future improvements: database storage, validation, authentication.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBSGFqdXNyYWtlbmR1c3RlLWFsdXNlZCUzQSUzQXNhbmRlcnNvb3ZsaQ==" repo-name="Hajusrakenduste-alused"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
