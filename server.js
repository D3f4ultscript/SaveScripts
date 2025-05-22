const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Aktiviere CORS für alle Routen
app.use(cors());

// Speicher für Scripts
let scripts = new Map();

// Route zum Speichern eines Scripts
app.post('/script', express.json(), (req, res) => {
    const { id, content } = req.body;
    scripts.set(id, content);
    res.json({ success: true });
});

// Route zum Abrufen eines Scripts
app.get('/script/:id', (req, res) => {
    const content = scripts.get(req.params.id);
    if (content) {
        res.type('text/plain').send(content);
    } else {
        res.status(404).send('Script nicht gefunden');
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
}); 