// Load node modules
// CAUTION: uncomment this when pushing to heroku
require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const cron = require('node-cron');
const cookieSession = require('cookie-session');
const scraper = require('./scripts/scraper.js');
const db = require('./scripts/db/db.js');
const config = require('./config.js');
const auth = require('./controllers/auth.js');

const app = express();

// Express configs -----------------------------------------------------

app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/dist/views');
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }))

// save a cookie 
app.use(cookieSession({
  name: 'session',
  secret: 'secretabcdsecret',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
}));

app.use('/auth', auth.router);

// Routing -------------------------------------------------------------

// GET request handling
app.get('/', function(req, res) {
  res.render("index", {
    netid: req.session.netid
  });
});

// Default
app.get(/\/.+/, function(req, res) {
  res.send("Page not found");
});

// TESTING insertion into preferences
app.post('/addprefs', auth.isLoggedIn, function(req, res) {
  if (req.body.dish) 
    db.addDishPref(req.session.netid, req.body.dish);
    db.updateDish("buuz", "test", "test");
  res.redirect('back');
});

// Start server
app.listen(config.port, async function() {
  // Scrape dishes into database once every day
  cron.schedule('0 0 0 * * *', () => {
    console.log("Scraping today's dishes: " + new Date());
    scraper.scrapeDishes();
  }, {
    timezone: 'America/New_York'
  });

  console.log("Listening on %d", config.port);
});