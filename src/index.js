// Load modules --------------------------------------------------------
// CAUTION: uncomment this when pushing to heroku
// require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const cron = require('node-cron');
const cookieSession = require('cookie-session');
const scraper = require('./scripts/scraper.js');
const menus = require('./scripts/menus.js');
const db = require('./scripts/db/db.js');
const config = require('./config.js');
const auth = require('./controllers/auth.js');
const prefs = require('./controllers/preferences.js');

const app = express();

// Express configs -----------------------------------------------------

app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/dist/views');
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.urlencoded({ extended: false }))

// save a cookie 
app.use(cookieSession({
  name: 'session',
  secret: 'secretabcdsecret',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
}));

// set routers
app.use('/auth', auth.router);
app.use('/preferences', prefs.router);

// Routing -------------------------------------------------------------

// GET request handling
app.get('/', function(req, res) {
  res.render('index', {
    netid: req.session.netid
  });
});

app.get('/menu', function(req, res) {
  let mealItems;
  const reqMeal = req.query.meal;
  if      (reqMeal == 'breakfast') mealItems = menus.breakfast()[0];
  else if (reqMeal == 'lunch') mealItems = menus.lunch()[0];
  else if (reqMeal == 'dinner') mealItems = menus.dinner()[0];
  else mealItems = menus.lunch()[0];
  res.render('menu', {
    netid: req.session.netid,
    meal: mealItems
  });
});

// Default
app.get(/\/.+/, function(req, res) {
  res.send("Page not found");
});

// TESTING change meal for menu
app.post('/changemeal', function(req, res) {

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

  menus.init();
  console.log("Listening on %d", config.port);
});