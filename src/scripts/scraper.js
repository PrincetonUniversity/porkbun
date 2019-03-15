const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const url = 'http://menus.princeton.edu/dining/_Foodpro/online-menu/menuDetails.asp?sName=Princeton+University+Campus+Dining&locationNum=02&locationName=Butler+%26+Wilson+Colleges&naFlag=1';

var scrape = function scrape() {
  axios.get(url)
    .then(response => {
      let meals = [];
      let $ = cheerio.load(response.data);
      $('.recipe').each((i, recipe) => {
        meals.push($(recipe).text()+'\n');
      });

      // have to clear the file, since i used appendFile (there's probably a better way)
      fs.writeFile('./temp', '', err => {
        if (err)
          return console.log(err)  
        }
      );

      meals.forEach(meal => {
        fs.appendFile('./temp', meal, err => {
          if (err) 
            return console.log(err);
        });
      });
      console.log("Success");
    });
}

module.exports.scrape = scrape;