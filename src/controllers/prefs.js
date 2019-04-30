// Load modules
const express = require('express');
const db = require('../scripts/db/db.js');
const auth = require('./auth.js');

// Router for preferences
const router = express.Router();

// Display the preferences page if user is logged in
router.get('/', auth.isLoggedIn, async (req, res) => {
  const [dishPrefs, locPrefs] = await Promise.all([
    db.getDishPrefs(req.session.netid),
    db.getLocationPrefs(req.session.netid)
  ]);

  res.render('prefs', {
    netid: req.session.netid,
    dishPrefs: dishPrefs,
    locationPrefs: locPrefs,
    autocomplete: db.findDishes
  });
});
  
// Insert dish into preferences, and echo the dish added
router.post('/', auth.isLoggedIn, (req, res) => {
  if (req.body.dish) {
    db.addDishPref(req.session.netid, req.body.dish);
    res.send(req.body.dish);
  } else {
    res.status(400);
  }
});

// Insert location, day, and meal time into preferences and echo the pref added
router.post('/locs', auth.isLoggedIn, (req, res) => {
  if (req.body.dhall && req.body.day && req.body.meal) {
    let dhall = req.body.dhall;
    let meal  = req.body.meal;
    let day   = req.body.day;
    db.addLocationPref(req.session.netid, dhall, meal, day);
    res.send({
      dhall: dhall,
      meal: meal,
      day: day
    });
  } else {
    res.status(400);
  }
});

// Updates the ranking of location preferences for a given day and meal
router.post('/rank', auth.isLoggedIn, (req, res) => {
  if (req.body.dhalls && req.body.day && req.body.meal) {
    let dhalls = req.body.dhalls;
    let meal   = req.body.meal;
    let day    = req.body.day;
    db.updateLocationRank(req.session.netid, dhalls, meal, day);
    res.send('Success');
  } else {
    res.status(400);
  }
});

// Removes dish (dish passed as query parameter)
router.get('/remove', auth.isLoggedIn, async (req, res) => {
  let dish = req.query.dish;
  let dhall = req.query.dhall;
  let meal = req.query.meal;
  let day = req.query.day;
  if (dish)
    await db.removeDishPref(req.session.netid, dish);
  if (dhall && day && meal)
    await db.removeLocationPref(req.session.netid, dhall, meal, day);
  res.redirect('/prefs');
});

module.exports.router = router;
