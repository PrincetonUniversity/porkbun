// Load node modules -----------------------------------------------------------
const cheerio = require('cheerio');
const axios = require('axios');
const db = require('./db/db.js');

// Constants -------------------------------------------------------------------
const baseurl = 'http://menus.princeton.edu/dining/_Foodpro/online-menu/menuDetails.asp?';
const locations = {
  roma: '01',
  wucox: '02',
  forbes: '03',
  grad: '04',
  cjl: '05',
  whitman: '08'
};

// Methods ---------------------------------------------------------------------

// Get the URL to fetch data from, based on date and dining hall
const getURL = (date, loc) => {
  const month = date.getUTCMonth()+1;
  const day   = date.getUTCDate();
  const year  = date.getUTCFullYear();
  return `${baseurl}dtdate=${month}%2F${day}%2F${year}&locationNum=${loc}`;
}

// Format word so it doesn't have any special characters or consecutive spaces
const formatWord = (word) => {
  let result = word.replace(/�/g, 'é');
  result = result.replace(/\s\s+/g, ' ');
  return result;
}

// Scrape all of today's dishes into the dishes database
const scrapeDishes = async () => {
  const date = new Date();
  for (const loc in locations) {
    await axios.get(getURL(date, locations[loc]))
      .then(async res => {
        let $ = cheerio.load(res.data);
        let meals = [];
        $('.card').each((i, elem) => {
          meals.push(elem);
        });

        for (meal of meals) {
          const mealName = $(meal).find($('.mealName')).text();
          if (mealName == "Brunch") mealName = "Lunch";
          const dishes = $(meal).find($('.recipe'));
          
          let items = [];
          dishes.each((i, elem) => {
            items.push(formatWord($(elem).text()));
          });

          for (item of items) {
            await db.updateDish(item, locations[loc], mealName)
              .catch(err => {
                throw err;
              });
          }
        }
      })
      .catch(err => {
        throw err;
      });
  }
}

// Scrape the menu for a given date and location and return as an array
const scrapeMenu = (date, loc) => {
  return new Promise((resolve, reject) => {
    axios.get(getURL(date, locations[loc]))
      .then(res => {
        let $ = cheerio.load(res.data);
        let items = {
          Breakfast: [],
          Lunch:     [],
          Dinner:    []
        };
        
        $('.card').each((i, item) => {
          let mealName = $(item).find($('.mealName')).text();
          if (mealName == "Brunch") mealName = "Lunch";

          const listItems = $(item).find($('.list-group-item'));
          listItems.each((j, listItem) => {
            items[mealName].push($(listItem).find($('h6')).text());

            const dishes = $(listItem).find($('.recipe'));
            dishes.each((k, dish) => {
              items[mealName].push(formatWord($(dish).text()));
            });
          });
        });
        return resolve(items);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

// Export modules --------------------------------------------------------------
module.exports.scrapeDishes = scrapeDishes;
module.exports.scrapeMenu = scrapeMenu;