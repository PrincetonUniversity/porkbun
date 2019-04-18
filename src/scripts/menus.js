// Load modules ----------------------------------------------------------------
const scraper = require('./scraper.js');
const db = require('./db/db.js');

// Constants -------------------------------------------------------------------
const locations = [
  'roma',
  'wucox',
  'whitman',
  'forbes',
  'cjl',
  //'grad'
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

// Get ranked menus, based on the given meal and prefs
const getRankedMenus = async (prefs, meal) => {
    const reqMeal = getMenus(meal);
    if (!prefs) return reqMeal;

    let prefCounts = [];
    for (var i = 0; i < 7; i++) {
      prefCounts[i] = [];
      for (const loc of locations) {
        let count = 0;
        if (reqMeal[i][loc]) {
          for (const item of reqMeal[i][loc]) {
            if (db.matchPrefs(prefs, item))
              count++;
          }
        }
        prefCounts[i].push([loc, count]);
      }
      prefCounts[i].sort(function(a, b) {
        return (b[1] - a[1]);
      });
    }

    let rankedMenu = [];
    for (var i = 0; i < 7; i++) {
      rankedMenu[i] = {};
      for (var j = 0; j < prefCounts[i].length; j++) {
        let dhall = prefCounts[i][j][0];
        rankedMenu[i][dhall] = reqMeal[i][dhall];
      }
    }
    return rankedMenu;
}

// Export modules --------------------------------------------------------------
module.exports.init = init;
module.exports.updateMenus = updateMenus;
module.exports.getMenus = getMenus;
module.exports.getDates = getDates;
module.exports.getRankedMenus = getRankedMenus;