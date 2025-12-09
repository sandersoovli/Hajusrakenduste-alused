---
title: Posts Service
---
This service handles blog posts for the application. It provides the following functionalities:

1. Retrieve all posts (`GET /posts`)

2. Create a new post (`POST /posts`) and emit an event to the event bus

3. Receive events from the event bus (`POST /events`)

Posts are currently stored in memory. Each post has a unique `id` and a `title`.

1. Retrieve all posts (`GET /posts`)

<SwmSnippet path="/posts/index.js" line="16">

---

&nbsp;

```javascript
app.get('/posts', (req, res) => {
  res.json(posts);
});
```

---

</SwmSnippet>

2. Create a new post (`POST /posts`) and emit an event to the event bus

<SwmSnippet path="/posts/index.js" line="20">

---

&nbsp;

```javascript
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
```

---

</SwmSnippet>

3. Receive events from the event bus (`POST /events`)

<SwmSnippet path="/posts/index.js" line="38">

---

&nbsp;

```javascript
app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    posts.push(data);
  }

  console.log('Received Event:', req.body);
  res.send({});
});
```

---

</SwmSnippet>

### **Steps / How to Run and Test**

1. Open terminal and navigate to posts service folder: <SwmPath>[posts/](/posts/)</SwmPath>


2. Install dependencies:

```plaintext
npm install

```

3. Start the service:

```plaintext
node index.js

```

4. Test the endpoints using curl or Postman:

**Get all posts:**

```plaintext
curl http://localhost:3001/posts

```

**Create a new post:**

```plaintext
curl -X POST http://localhost:3001/posts \
-H "Content-Type: application/json" \
-d '{"title":"My first post"}'

```

**Send a PostCreated event manually (optional):**

```plaintext
curl -X POST http://localhost:3001/events \
-H "Content-Type: application/json" \
-d '{"type":"PostCreated","data":{"id":"abcd","title":"Test"}}'
```

### **Additional Information / Tips**

- Posts are stored in memory; restarting the service will clear them.

- Each new post triggers a `PostCreated` event to the Event Bus.

- Future improvements: database storage, validation, authentication.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBSGFqdXNyYWtlbmR1c3RlLWFsdXNlZCUzQSUzQXNhbmRlcnNvb3ZsaQ==" repo-name="Hajusrakenduste-alused"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
