// Load modules ----------------------------------------------------------------
const scraper = require('./scraper.js');

// Constants -------------------------------------------------------------------
const locations = [
  'roma',
  'wucox',
  'whitman',
  'forbes',
  'cjl',
];

var breakfast = [];
var lunch = [];
var dinner = [];

// Methods ---------------------------------------------------------------------

// Fill in breakfast, lunch, and dinner arrays with menus for the whole week
const init = () => {
  return new Promise(async (resolve, reject) => {
    for (var i = 0; i < 7; i++) {
      breakfast[i] = {};
      lunch[i]     = {};
      dinner[i]    = {};
    }

    const date = new Date();
    for (var i = 0; i < 7; i++) {
      const tempDate = new Date(date.getTime());
      for (const loc of locations) {
        await scraper.scrapeMenu(tempDate, loc)
          .then(res => {
            breakfast[i][loc] = orderMenu(res.Breakfast);
            lunch[i][loc]     = orderMenu(res.Lunch);
            dinner[i][loc]    = orderMenu(res.Dinner);
          });
      }
      date.setDate(date.getDate()+1);
    }
    return resolve("Success");
  });
}

// Update the menus by shifting all menus forward by one
const updateMenus = async () => {
  for (var i = 6; i > 0; i--) {
    breakfast[i] = breakfast[i-1];
    lunch[i]     = lunch[i-1];
    dinner[i]    = dinner[i-1];
  }

  const date = new Date();
  for (const loc of locations)
    await scraper.scrapeMenu(date, loc)
      .then(res => {
        breakfast[0][loc] = orderMenu(res.Breakfast);
        lunch[0][loc]     = orderMenu(res.Lunch);
        dinner[0][loc]    = orderMenu(res.Dinner);
      });
}

// Order menus to prioritize entrees
const orderMenu = (items) => {
  let priority = [];
  let normal = [];

  for (var i = 0; i < items.length; i++) {
    if (items[i].match(/-.*Entree.*-/)) {
      priority.push(items[i]);
      for (var j = i + 1; j < items.length; j++) {
        if (items[j].match(/-.*-/)) break;
        
        priority.push(items[j]);
        i = j;
      }
    }
    else normal.push(items[i]);
  }
  return priority.concat(normal);  
}

// Get dates in the current week
const getDates = () => {
  const date = new Date();
  let dates = [];

  for (var i = 0; i < 7; i++) {
    const tempDate = new Date(date.getTime());
    dates.push(tempDate);
    date.setDate(date.getDate()+1);
  }

  return dates;
}

// Get menus, based on the given meal
const getMenus = (meal) => {
  if      (meal == 'breakfast') return breakfast;
  else if (meal == 'lunch')     return lunch;
  else if (meal == 'dinner')    return dinner;
  else {
    const hour = new Date().getHours();
    if (14 <= hour && hour < 20)
      return dinner;
    return lunch;
  }
}

// See if given dish is in a set of preferences
const matchPrefs = (prefs, menuItem) => {
  for (var i in prefs) {
    const rePref = new RegExp(prefs[i], 'i');
    if (menuItem.match(rePref))
      return true;
  }
  return false;
}

// Get ranked menus, based on the given meal and prefs
const getRankedMenus = async (dishPrefs, locPrefs, meal) => {
  const reqMeal = getMenus(meal);
  if (dishPrefs.length == 0 && locPrefs.length == 0) return reqMeal;

  const dates = getDates();
  let ranked = [];
  for (var i = 0; i < 7; i++) {
    ranked[i] = [];
    for (const loc of locations) {
      // Handle dish preferences
      let dishPrefMatches = 0;
      if (reqMeal[i][loc]) {
        for (const item of reqMeal[i][loc]) {
          if (matchPrefs(dishPrefs, item))
            dishPrefMatches++;
        }
      }

      // Handle location preferences
      let locPrefIndex = -1;
      if (Object.keys(locPrefs).length > 0) {
        if (meal != 'breakfast' && meal != 'lunch' && meal != 'dinner') {
          const hour = new Date().getHours();
          if (14 <= hour && hour < 20) meal = 'dinner';
          else meal = 'lunch';
        }
        const day = dates[i].getDay();
        const locPrefDay = locPrefs[Object.keys(locPrefs)[day]][meal];
        if (locPrefDay) locPrefIndex = locPrefDay.indexOf(loc);
      }
      ranked[i].push([loc, dishPrefMatches, locPrefIndex]);
    }

    // Sort based on the ranking algorithm
    ranked[i].sort(rankingAlgorithm);
  }

  let rankedMenu = [];
  for (var i = 0; i < 7; i++) {
    rankedMenu[i] = {};
    for (var j = 0; j < ranked[i].length; j++) {
      let dhall = ranked[i][j][0];
      rankedMenu[i][dhall] = reqMeal[i][dhall];
    }
  }
  return rankedMenu;
}

// Ranking algorithm for the various dining hall options for a given meal
const rankingAlgorithm = (a, b) => {
  // Case 1: a and b are both not in loc prefs (based on dish matches)
  if (a[2] == -1 && b[2] == -1)
    return (b[1] - a[1]);
  
  // Case 2: a fits location prefs, but b doesn't (a gets returned)
  else if (a[2] >= 0 && b[2] == -1)
    return -1;
  
  // Case 3: b fits location prefs, but a doesn't (b gets returned)
  else if (b[2] >= 0 && a[2] == -1)
    return 1;
  
  // Case 4: a and b are both in loc prefs (based on both dish and loc matches)
  else {
    let locDiff, dishDiff;

    // a's loc is more preferred
    if (a[2] < b[2]) {
      locDiff  = b[2] - a[2];   // how many more indices a is above b
      dishDiff = b[1] - a[1];   // how many more matches b has than a
      return dishDiff - locDiff;
    }
    // b's loc is more preferred 
    else {
      locDiff  = a[2] - b[2];   // how many more indices b is above a
      dishDiff = a[1] - b[1];   // how many more matches a has than b
      return locDiff - dishDiff;
    }
  }
}

// Get matches between menu and prefs
const getPrefMatches = async (prefs, meal) => {
  if (!prefs) return null;
  const reqMeal = getMenus(meal);

  let matches = [];
  for (var i = 0; i < 7; i++) {
    matches[i] = {};
    for (const loc of locations) {
      matches[i][loc] = [];
      if (reqMeal[i][loc]) {
        for (const item of reqMeal[i][loc]) {
          if (matchPrefs(prefs, item))
            matches[i][loc].push(item);
        }
      }
    }
  }
  return matches;
}

// Export modules --------------------------------------------------------------
module.exports.init = init;
module.exports.updateMenus = updateMenus;
module.exports.getMenus = getMenus;
module.exports.getDates = getDates;
module.exports.getRankedMenus = getRankedMenus;
module.exports.getPrefMatches = getPrefMatches;
module.exports.matchPrefs = matchPrefs;