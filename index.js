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
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.send(`
    (function () {
      function detectAttack(formData) {
        const attackPatterns = [
          /(--|#|;|\\/\\*)/i,
          /\\b(UNION|SELECT|INSERT|DELETE|UPDATE|DROP|TRUNCATE|ALTER|EXEC|FROM|WHERE|TABLE)\\b/i,
          /\\b(OR|AND)\\b.*[=<>]/i,
          /('|")/,
          /<script.*?>.*?<\\/script>/i,
          /\\b(onerror|onload|onclick|alert|document\\.cookie)\\b/i,
          /[;&|]{1,2}/,
          /\\b(cat|ls|whoami|wget|curl|nc|bash|sh)\\b/i,
          /\\.\\.\\/|etc\\/passwd|boot\\.ini/i,
          /(http|https):\\/\\/(127\\.0\\.0\\.1|localhost|169\\.254\\.169\\.254|0\\.0\\.0\\.0)/i
        ];

        return Object.values(formData).some(value =>
          attackPatterns.some(pattern => pattern.test(value))
        );
      }

      document.addEventListener('submit', function (event) {
        let formData = new FormData(event.target);
        let formObject = {};
        formData.forEach((value, key) => formObject[key] = value);

        if (detectAttack(formObject)) {
          fetch("/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              formObject,
              userAgent: navigator.userAgent,
              type: "deceptive-form",
              location: window.location.href
            })
          }).then(() => {
            window.location.href = "/admin";
          }).catch(err => console.error("Track failed", err));

          console.warn("Attack pattern detected. Redirecting to honeypot.");
          event.preventDefault();
        }
      }, true);
    })();
  `);
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