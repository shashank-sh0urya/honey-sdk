const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve honeypot.js
app.get('/honeypot.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(__dirname + '/honeypot.js');
});

// Track endpoint
app.post('/track', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const logData = `
        Time: ${new Date().toISOString()}
        IP: ${clientIp}
        User-Agent: ${req.body.userAgent}
        Location: ${req.body.location}
        Data: ${JSON.stringify(req.body.formObject)}
    `;

    fs.appendFileSync('attackers.log', logData + "\n");
    console.log('Attack logged:', logData);

    res.status(200).json({ message: 'Tracked successfully' });
});

// Admin decoy panel
app.get('/admin', (req, res) => {
    res.send('<h1>Admin Panel</h1><p>Unauthorized access is monitored.</p>');
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Honeypot running at http://localhost:${PORT}`);
});
app.get('/', (req, res) => {
  res.send('Honeypot SDK is active. Use /honeypot.js to load the script.');
});