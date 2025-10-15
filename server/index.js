const express = require('express');  // õige nimi
const { randomBytes } = require('node:crypto');
const cors = require('cors');

const app = express();   // experss → express
app.use(express.json()); // experss.json() → express.json()
app.use(cors({origin: 'http://localhost:3000'} ));

const posts = [];

app.get('/', (req, res) => {
    res.send('Tere tulemast minu blogi serverisse!');
});


app.get('/posts', (req, res) => {
    res.json(posts);
});

app.post('/posts', (req, res) => {
    const title = req.body.title;
    const post = {
        id: randomBytes(4).toString('hex'),
        title
    };
    posts.push(post);  // siin oli ka viga
    res.status(201).json({ post });
});

const postComments =[];

app.get('/posts/:id/comments', (req, res) =>{
    res.json(postComments.filter(comment => comment.postId === req.params.id));
});

app.post('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const content = req.body.content;

    const postExists = posts.find(p => p.id === postId);
    if (!postExists) {
        return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
        id: randomBytes(4).toString('hex'),
        postId,
        content
    };
    postComments.push(comment);
    res.status(201).json({ comment });
});


app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
