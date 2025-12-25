const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
// Check common output paths for Angular Application Builder
const distPath = path.join(__dirname, 'dist/resume-app/browser');

app.use(express.static(distPath));

// Send all other requests to the Angular app
app.get('/*', function (req, res) {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start the app by listening on the default Heroku/Railway port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server started on port ' + port);
    console.log('Serving from: ' + distPath);
});
