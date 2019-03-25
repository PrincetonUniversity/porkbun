// Load node modules
const express = require('express');
const ejs = require('ejs');
const cron = require('node-cron');
const scraper = require('./scripts/scraper.js');
const db = require('./scripts/db.js');

const app = express();

// Express configs (have to use views/ directory to use res.render)
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/dist/views');
app.use(express.static(__dirname + '/static'));

// GET request handling
app.get('/', function(req, res) {
  res.render("index.html");
});

// Default
app.get(/\/.+/, function(req, res) {
  res.send("Page not found");
});

// Start server
const port = process.argv[2] ? process.argv[2] : 3000;
app.listen(port, function() {
  cron.schedule('0 0 0 * * *', () => {
    console.log('Code for running every midnight');
    
  }, {
    timezone: 'America/New_York'
  });
  
  scraper.scrapeIntoDB();
  //db.updateDish("turkey", "03", "lunch");
  console.log("Listening on %d", port);
});
