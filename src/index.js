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
const prefs = require('./controllers/prefs.js');

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
app.use('/prefs', prefs.router);

// Routing -------------------------------------------------------------

// GET request handling
app.get('/', function(req, res) {
  res.redirect('/menu');
});

app.get('/menu', function(req, res) {
  const mealItems = menus.getMenus(req.query.meal)[0];

  res.render('menu', {
    netid: req.session.netid,
    meal: mealItems
  });
});

app.get('/weekly', function(req, res) {
  res.render('weekly', {

  });
});

app.get('/landing', function(req, res) {
  res.render('landing', {
    // Landing page - should basically look pretty and lead to our website
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
  });

  // Update scraped menus after 8pm each day
  cron.schedule('0 0 20 * * *', () => {
    console.log("Updating weekly menus: " + new Date());
    menus.updateMenus();
  });

  menus.init();
  console.log("Listening on %d", config.port);
});