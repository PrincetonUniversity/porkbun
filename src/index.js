// Load node modules
const express = require('express');
const scraper = require('./scripts/scraper.js');

const app = express();

// GET request handling
app.get('/', function(req, res) {
  res.send('Hello World!');
});

// Start server
const port = process.argv[2] ? process.argv[2] : 3000;
app.listen(port, function() {
  scraper.scrape();
  console.log("Listening on %d", port);
});
