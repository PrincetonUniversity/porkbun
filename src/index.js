// Load node modules
const express = require('express');
const ejs = require('ejs');
const cron = require('node-cron');
const scraper = require('./scripts/scraper.js');
const db = require('./scripts/db.js');
const config = require('./config.js');
const cookieSession = require('cookie-session');
const auth = require('./controllers/auth.js');

const app = express();

// Express configs -----------------------------------------------------

app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/dist/views');
app.use(express.static(__dirname + '/static'));

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

// Start server
app.listen(config.port, async function() {
  cron.schedule('0 0 0 * * *', () => {
    console.log('Code for running every midnight');
    // scraper.scrapeDishes();
  }, {
    timezone: 'America/New_York'
  });
  
  await db.init()
    .catch(err => {
      console.log(err.message);
    });

  // CAUTION: right now I'm running this code once every day to properly update
  // the database until we have a server deployed on heroku
  // scraper.scrapeDishes();
  console.log("Listening on %d", config.port);
});
