const path = require('path');

exports.uploadFile = (req, res) => {
    console.log("Request body:", req.body);
    console.log("File upload request received:", req.file);
    if (req.file) {
        res.json({ imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).send('No file uploaded');
    }
};
