// Load node modules
const express = require('express');
const scraper = require('./scripts/scraper.js');

const app = express();

// Express configs (have to use views/ directory to use res.render)
app.set("view engine", "ejs");
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + "/dist"));

// GET request handling
app.get('/', function(req, res) {
  res.render("index.html");
});

// Default
app.get('/*', function(req, res) {
  res.send("Page not found");
});

// Start server
const port = process.argv[2] ? process.argv[2] : 3000;
app.listen(port, function() {
  scraper.scrape();
  console.log("Listening on %d", port);
});
