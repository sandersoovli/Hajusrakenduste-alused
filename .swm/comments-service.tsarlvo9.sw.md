---
title: Comments Service
---
The Comments service manages comments for blog posts. It has the following functionalities:

1. Retrieve all comments for a post (<SwmPath>[comments/](/comments/)</SwmPath>)

2. Create a comment for a post (<SwmPath>[comments/](/comments/)</SwmPath>) and emit a <SwmToken path="/comments/index.js" pos="48:5:5" line-data="      type: &#39;CommentCreated&#39;,">`CommentCreated`</SwmToken> event

3. Receive events from the Event Bus (<SwmToken path="/comments/index.js" pos="21:11:11" line-data="  methods: [&quot;GET&quot;, &quot;POST&quot;, &quot;PUT&quot;, &quot;DELETE&quot;, &quot;OPTIONS&quot;],">`POST`</SwmToken>` `<SwmToken path="/comments/index.js" pos="47:17:18" line-data="    await axios.post(&#39;http://event-bus-srv:5005/events&#39;, {">`/events`</SwmToken>) and react accordingly:

   - <SwmToken path="/comments/index.js" pos="62:9:9" line-data="  if (type === &#39;PostCreated&#39;) {">`PostCreated`</SwmToken> → initialize empty comments for new post

   - <SwmToken path="/comments/index.js" pos="66:9:9" line-data="  if (type === &#39;CommentModerated&#39;) {">`CommentModerated`</SwmToken> → update comment status and emit <SwmToken path="/comments/index.js" pos="78:5:5" line-data="        type: &#39;CommentUpdated&#39;,">`CommentUpdated`</SwmToken> event

All comments are currently stored in memory in the <SwmToken path="/comments/index.js" pos="32:5:5" line-data="  res.json(commentsByPostId[req.params.id] || []);">`commentsByPostId`</SwmToken> object.

1. Retrieve all comments for a post (<SwmToken path="/comments/index.js" pos="21:6:6" line-data="  methods: [&quot;GET&quot;, &quot;POST&quot;, &quot;PUT&quot;, &quot;DELETE&quot;, &quot;OPTIONS&quot;],">`GET`</SwmToken>` `<SwmPath>[posts/](/posts/)</SwmPath>`:id/comment`

<SwmSnippet path="/comments/index.js" line="31">

---

&nbsp;

```javascript
app.get('/posts/:id/comments', (req, res) => {
  res.json(commentsByPostId[req.params.id] || []);
});
```

---

</SwmSnippet>

2. Create a comment for a post (<SwmPath>[comments/](/comments/)</SwmPath>) and emit a <SwmToken path="/comments/index.js" pos="48:5:5" line-data="      type: &#39;CommentCreated&#39;,">`CommentCreated`</SwmToken> event

<SwmSnippet path="/comments/index.js" line="36">

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
    await axios.post('http://event-bus-srv:5005/events', {
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

3. Receive events from the Event Bus (<SwmToken path="/comments/index.js" pos="21:11:11" line-data="  methods: [&quot;GET&quot;, &quot;POST&quot;, &quot;PUT&quot;, &quot;DELETE&quot;, &quot;OPTIONS&quot;],">`POST`</SwmToken>` `<SwmToken path="/comments/index.js" pos="47:17:18" line-data="    await axios.post(&#39;http://event-bus-srv:5005/events&#39;, {">`/events`</SwmToken>) and react accordingly:

- <SwmToken path="/comments/index.js" pos="62:9:9" line-data="  if (type === &#39;PostCreated&#39;) {">`PostCreated`</SwmToken> → initialize empty comments for new post

- <SwmToken path="/comments/index.js" pos="66:9:9" line-data="  if (type === &#39;CommentModerated&#39;) {">`CommentModerated`</SwmToken> → update comment status and emit <SwmToken path="/comments/index.js" pos="78:5:5" line-data="        type: &#39;CommentUpdated&#39;,">`CommentUpdated`</SwmToken> event

<SwmSnippet path="/comments/index.js" line="59">

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
      await axios.post('http://event-bus-srv:5005/events', {
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

```
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

- `Posts Service` emits <SwmToken path="/comments/index.js" pos="62:9:9" line-data="  if (type === &#39;PostCreated&#39;) {">`PostCreated`</SwmToken> → <SwmToken path="/comments/index.js" pos="91:6:6" line-data="  console.log(&#39;Comments service running on http://0.0.0.0:5001&#39;);">`Comments`</SwmToken>` Service` initializes comments for the new post.

- New comments emit <SwmToken path="/comments/index.js" pos="48:5:5" line-data="      type: &#39;CommentCreated&#39;,">`CommentCreated`</SwmToken> → sent to Event Bus.

- Moderator service sends <SwmToken path="/comments/index.js" pos="66:9:9" line-data="  if (type === &#39;CommentModerated&#39;) {">`CommentModerated`</SwmToken> → <SwmToken path="/comments/index.js" pos="91:6:6" line-data="  console.log(&#39;Comments service running on http://0.0.0.0:5001&#39;);">`Comments`</SwmToken>` Service` updates status and emits <SwmToken path="/comments/index.js" pos="78:5:5" line-data="        type: &#39;CommentUpdated&#39;,">`CommentUpdated`</SwmToken>.

- Frontend interacts with Comments Service via GET and POST endpoints.

### **Additional Information / Tips**

- Comments are stored in memory; restarting the service will clear them.

- Each new comment emits a <SwmToken path="/comments/index.js" pos="48:5:5" line-data="      type: &#39;CommentCreated&#39;,">`CommentCreated`</SwmToken> event to the Event Bus.

- Comments can be moderated externally; <SwmToken path="/comments/index.js" pos="66:9:9" line-data="  if (type === &#39;CommentModerated&#39;) {">`CommentModerated`</SwmToken> events update the status.

- Logs show all received events for easier debugging.

- Future improvements: database storage, validation, authentication.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBSGFqdXNyYWtlbmR1c3RlLWFsdXNlZCUzQSUzQXNhbmRlcnNvb3ZsaQ==" repo-name="Hajusrakenduste-alused"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
