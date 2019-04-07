// load modules
const express = require('express');
const config = require('../config.js');
const CAS = require('cas');

// auth configuration
const casUrl = "https://fed.princeton.edu/cas/";
const cas = new CAS({
  base_url: casUrl,
  service: config.host + '/auth/verify'
});

// router to handle requests specific to authentication
const router = express.Router();

// redirect user to CAS server
router.get("/login", (req, res) => {
  res.redirect(casUrl + "login?service=" + config.host + '/auth/verify');
});

// validate the service ticket sent by CAS
router.get("/verify", (req, res) => {
  // if user is already logged in
  if (req.session.netid) {
    res.redirect(req.session.redirect || '/');
    return;
  }

  let ticket = req.query.ticket;
  cas.validate(ticket, (err, status, netid) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    req.session.netid = netid;
    res.redirect(req.session.redirect || '/');
  });
});

// Logout route - destroy cookie and log out of CAS
router.get('/logout', (req, res) => {
  req.session = null;
  res.redirect(casUrl + 'logout?url=' + config.host);
});

// Middleware that asks the user to log in before viewing certain pages
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.netid) {
    // move on to the next middleware if user is logged in
    next();
  } else {
    req.session.redirect = req.originalUrl;
    res.redirect('/auth/login');
  }
}

module.exports.router = router;
module.exports.isLoggedIn = isLoggedIn;