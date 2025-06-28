const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

// Serve honeypot SDK JS file
app.get('/honeypot.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'honeypot.js'));
});

// Log attacker data
app.post('/track', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const logData = `
Time: ${new Date().toISOString()}
IP: ${clientIp}
User-Agent: ${req.body.userAgent}
Data: ${JSON.stringify(req.body.formObject)}
`;

  fs.appendFileSync('attackers.log', logData + "\n");
  console.log('Attack logged:', logData);
  res.status(200).json({ message: 'Tracked successfully' });
});

// Fake admin panel
app.get('/admin', (req, res) => {
  res.send('<h1>Admin Panel</h1><p>Unauthorized access is monitored.</p>');
});

app.listen(PORT, () => {
  console.log(`Honeypot SDK running at http://localhost:${PORT}`);
});
