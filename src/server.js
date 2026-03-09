const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const upload = require('./utils/fileHandler');
const store = require('./data/store');
const engine = require('./agent/universeEngine');

store.seedDB(); // Seed JSON DB if empty

const app = express();
const port = process.env.PORT || 3009;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// File upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    console.log("Request body:", req.body);
    console.log("File upload request received:", req.file);
    if (req.file) {
        res.json({ imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).send('No file uploaded');
    }
});

app.use('/api/ContentGenerationAPI', require('./routes/ContentGenerationAPI'));
app.use(routes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    engine.startEngine(); // Launch background autonomous universe engine
});