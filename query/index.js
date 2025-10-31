const express = require('express');
const cors = require('cors');
// axios on vajalik vaid sündmuste ajaloo taastamiseks (Event Replay), 
// kuid antud koodi näites pole see vajalik, kui te ei rakenda Event Replay'd.

const app = express();
app.use(express.json());
// Luba päringud brauserist (tavaliselt 3000)
app.use(cors({ origin: 'http://localhost:3000' }));

// Andmestruktuur: Iga postitus on võtmeks, väärtus sisaldab postitust ja kommentaare
// { 'postId1': { id: 'postId1', title: 'Postituse Pealkiri', comments: [...] }, ... }
const posts = {};

// GET /posts: Annab kliendile kõik koondatud andmed kätte
app.get('/posts', (req, res) => {
    // Saadab kogu posts objekti tagasi
    res.json(posts); 
});

// POST /events: Kuulab sündmusbussilt saabuvaid sündmusi
app.post('/events', (req, res) => {
    const { type, data } = req.body;

    // Käsitle sündmuse andmete töötlemine eraldi funktsiooniga
    handleEvent(type, data);

    console.log('Received Event by Query Service:', req.body);
    res.send({});
});

// Funktsioon andmete töötlemiseks vastavalt sündmuse tüübile
const handleEvent = (type, data) => {
    if (type === 'PostCreated') {
        // Postituse loomisel: loo andmestruktuuris uus kanne ja lisa tühi kommentaaride massiiv
        const { id, title } = data;
        posts[id] = { id, title, comments: [] };
    } 
    
    if (type === 'CommentCreated') {
        // Kommentaari loomisel: lisa kommentaar vastava postituse kommentaaride massiivi
        const { id, content, postId } = data;
        
        // Kontrolli, kas postitus on olemas (peaks olema, kui event-bus töötab)
        const post = posts[postId];
        if (post) {
            post.comments.push({ id, content, postId });
        }
    }

    /// UUS KÄITLEMINE: Kui kommentaari staatus on muutunud (CommentUpdated)
    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data;
        
        const post = posts[postId];
        if (post) {
            const comment = post.comments.find(c => c.id === id);
            if (comment) {
                // Uuenda ainult staatus ja sisu (kui see peaks olema muutunud)
                comment.status = status; 
                comment.content = content; 
            }
        }
    }
};

// ** Tulevikus tuleks lisada sündmuste ajaloo taastamise loogika siia **
/*
const start = async () => {
    // Fetch events from event bus /events endpoint to rebuild 'posts' object
    // Pärast andmete taastamist, käivita server:
    app.listen(5002, () => {
        console.log('Query service running on http://localhost:5002');
    });
};

start();
*/

// Lihtsustatud käivitus:
app.listen(5002, () => {
    console.log('Query service running on http://localhost:5002');
});