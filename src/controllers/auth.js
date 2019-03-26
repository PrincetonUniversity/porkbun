// load modules
const express = require('express');
const config = require('../config.js');
const CAS = require('cas');

// auth configuration
const url = "https://fed.princeton.edu/cas/";
const cas = new CAS({
  base_url: url,
  service: config.host + '/auth/verify'
});

// router to handle requests specific to authentication
const router = express.Router();

// redirect user to CAS server
router.get("/login", (req, res) => {
  res.redirect(url + "login?service=" + config.host + '/auth/verify');
});

// validate the service ticket sent by CAS
router.get("/verify", (req, res) => {
  let ticket = req.query.ticket;

  cas.validate(ticket, (err, status, netid) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    req.session.netid = netid;
    res.redirect('/');
  });
});

module.exports.router = router;
