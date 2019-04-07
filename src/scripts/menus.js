// Load modules ----------------------------------------------------------------
const scraper = require('./scraper.js');

// Constants -------------------------------------------------------------------
const locations = [
  'roma',
  'wucox',
  'whitman',
  'forbes',
  'cjl',
  'grad'
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
      for (const loc of locations) {
        await scraper.scrapeMenu(date, loc)
          .then(res => {
            breakfast[i][loc] = res.Breakfast;
            lunch[i][loc]     = res.Lunch;
            dinner[i][loc]    = res.Dinner;
          });
      }
      date.setDate(date.getDate()+1);
    }
    return resolve("Success");
  });
}

// Update the menus by shifting all menus forward by one
const updateMenus = () => {
  return new Promise(async (resolve, reject) => {
    for (var i = 6; i > 0; i--) {
      breakfast[i] = breakfast[i-1];
      lunch[i]     = lunch[i-1];
      dinner[i]    = dinner[i-1];
    }
  
    const date = new Date();
    for (const loc of locations)
      await scraper.scrapeMenu(date, loc)
        .then(res => {
          breakfast[0][loc] = res.Breakfast;
          lunch[0][loc]     = res.Lunch;
          dinner[0][loc]    = res.Dinner;
        });
    
    return resolve("Success");
  });
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

// Export modules --------------------------------------------------------------
module.exports.init = init;
module.exports.updateMenus = updateMenus;
module.exports.getMenus = getMenus;