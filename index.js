const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the "public" folder
app.use(express.static("public"));

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Honeypot SDK server running. 🛡️");
});

app.listen(PORT, () => {
  console.log(`✅ Honeypot running at http://localhost:${PORT}`);
});
