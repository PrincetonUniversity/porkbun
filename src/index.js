const express = require('express');
const scraper = require('./scripts/scraper.js');
const app = express();

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(3000, function() {
  scraper.scrape();
  console.log("Example app listening on port 3000!");
});
