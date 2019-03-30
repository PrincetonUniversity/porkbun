// Load node modules
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const db = require('./db.js');

// Constants
const baseurl = 'http://menus.princeton.edu/dining/_Foodpro/online-menu/menuDetails.asp?';
const locations = {
  roma: '01',
  wucox: '02',
  forbes: '03',
  grad: '04',
  cjl: '05',
  whitman: '08'
};

// Get the URL to fetch data from, based on date and dining hall
const getURL = (date, loc) => {
  const month = date.getUTCMonth()+1;
  const day   = date.getUTCDate();
  const year  = date.getUTCFullYear();
  return `${baseurl}dtdate=${month}%2F${day}%2F${year}&locationNum=${loc}`;
}

// Scrape individual dining hall menu, based on date and dining hall
const getItems = (date, loc) => {
  return new Promise((resolve, reject) => {
    axios.get(getURL(date, locations[loc]))
      .then(res => {
        let items = [];
        let $ = cheerio.load(res.data);
        $('.recipe').each((i, recipe) => {
          items.push($(recipe).text()+'\n');
        });

        return resolve(items);
      })
      .catch(err => {
        return reject(err.message);
      });
  });
}

// Scrape all dining hall menus for today's menus
const scrape = async function() {
  const date = new Date();
  const file = fs.createWriteStream('./temp');

  for (const loc in locations) {
    file.write(loc.toUpperCase() + '\n');
    await getItems(date, loc)
      .then(items => {
        items.forEach(item => {
          file.write(item);
        });
      });
  }
  file.end("END OF SCRAPING");
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
          const dishes = $(meal).find($('.recipe'));
          
          let items = [];
          dishes.each((i, elem) => {
            items.push($(elem).text());
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

// Export modules
module.exports.scrape = scrape;
module.exports.scrapeDishes = scrapeDishes;