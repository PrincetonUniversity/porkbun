// Load node modules
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

// Constants
const baseurl = 'http://menus.princeton.edu/dining/_Foodpro/online-menu/menuDetails.asp';
const locations = {
  roma: '01',
  wucox: '02',
  forbes: '03',
  grad: '04',
  cjl: '05',
  whitman: '08'
};

// Get the URL to fetch data from, based on date and dining hall
function getURL(date, locationId) {
  return `${baseurl}?dtdate=${date.getMonth()+1}%2F${date.getDate()}%2F${date.getFullYear()}&locationNum=${locationId}`;
}

// Scrape individual dining hall menu, based on date and dining hall
function getItems(date, loc) {
  return new Promise((resolve, reject) => {
    axios.get(getURL(date, locations[loc]))
      .then(response => {
        let items = [];
        let $ = cheerio.load(response.data);
        $('.recipe').each((i, recipe) => {
          items.push($(recipe).text()+'\n');
        });

        return resolve(items);
      })
      .catch(error => {
        return reject(error.message);
      });
  });
}

// Scrape all dining hall menus for today's menus
async function scrape() {
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

module.exports.scrape = scrape;