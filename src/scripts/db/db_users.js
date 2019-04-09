let database = require('./db')

var users;
database.init()
  .then(db =>   { users = db.collection('users'); })
  .catch(err => { console.log(err.message); });

// Operatring on 'users' collection ------------------------------------------------

// Insert user 'netid' into the database, if it doesn't exist yet
const insertUser = netid => {
  let emptyMealPref = {
    breakfast: [/* e.g. "roma" */],
    lunch:     [],
    dinner:    []
  }
  
  let emptyLocPrefs = {
    sunday:    emptyMealPref,
    monday:    emptyMealPref,
    tuesday:   emptyMealPref,
    wednesday: emptyMealPref,
    thursday:  emptyMealPref,
    friday:    emptyMealPref,
    saturday:  emptyMealPref,
  }
  
  return new Promise((resolve, reject) => {
    users.insertOne({
      netid: netid,
      location_prefs: emptyLocPrefs,
      dish_prefs: []
    }, (err, res) => {
      if (err) return reject(err);
      if (res.insertedCount != 1) return reject('Error while inserting user');
      return resolve(res);
    });
  });
}
  
// Add 'dish' to the dish preferences of user 'netid'
const addDishPref = (netid, dish) => {
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $addToSet: { dish_prefs: dish }
    }, async (err, res) => {
      if (err) return reject(err);
      if (await users.countDocuments({netid: netid}) == 0) {
        await insertUser(netid);
        addDishPref(netid, dish);
      }
      return resolve("Success");
    });
  });
}

// Add preferred location "location" at preferred meal time "meal" on preferred day
const addLocationPref = (netid, location, meal, day) => {
  if (!meal || !day) return; // for now

  let key = `location_prefs.${day}.${meal}`;
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $addToSet: { [key]: location }
    }, async (err, res) => {
      if (err) return reject(err);
      if (await users.countDocuments({netid: netid}) == 0) {
        await insertUser(netid);
        addLocationPref(netid, location, meal, day);
      }
      return resolve("Success");
    });
  });
}

// Get the user's dish preferences as an array
const getDishPref = async (netid) => {
  const user = await users.findOne({ netid: netid });
  if (!user) return [];
  return user.dish_prefs;
}

// Remove 'dish' from user's dish preferences
const removeDishPref = (netid, dish) => {
  return new Promise((resolve, reject) => {
    users.updateOne({
      netid: netid
    }, {
      $pull: { dish_prefs: dish }
    }, async (err, res) => {
      if (err) return reject(err);
      return resolve("Success");
    });
  });
}

// See if given dish is in user's dish preferences
const matchPrefs = (prefs, menuItem) => {
  for (var i in prefs) {
    const rePref = new RegExp(prefs[i], 'i');
    if (menuItem.match(rePref))
      return true;
  }
  return false;
}

// Export modules
module.exports.addDishPref = addDishPref;
module.exports.getDishPref = getDishPref;
module.exports.removeDishPref = removeDishPref;
module.exports.addLocationPref = addLocationPref;
module.exports.matchPrefs = matchPrefs;