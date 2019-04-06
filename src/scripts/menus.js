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

const getBreakfast = () => {
  return breakfast;
}

const getLunch = () => {
  return lunch;
}

const getDinner = () => {
  return dinner;
}

const updateMenus = () => {
  const date = new Date();

}

// Export modules --------------------------------------------------------------
module.exports.breakfast = getBreakfast;
module.exports.lunch = getLunch;
module.exports.dinner = getDinner;

module.exports.init = init;