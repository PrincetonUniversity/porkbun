// load modules
const express = require('express');
const db = require('../scripts/db/db.js');
const auth = require('./auth.js');

// router for preferences
const router = express.Router();

// Display the preferences page if user is logged in
router.get('/', auth.isLoggedIn, async function(req, res) {
  res.render('prefs', {
    netid: req.session.netid,
    prefs: await db.getDishPref(req.session.netid)
  });
});
  
// Insertion into preferences
router.post('/', auth.isLoggedIn, function(req, res) {
  if (req.body.dish) 
    db.addDishPref(req.session.netid, req.body.dish);
  res.redirect('back');
});

module.exports.router = router;