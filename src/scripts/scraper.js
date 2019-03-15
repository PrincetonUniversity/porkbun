const axios = require('axios');
const fs = require('fs');
const url = 'http://menus.princeton.edu/dining/_Foodpro/online-menu/menuDetails.asp?sName=Princeton+University+Campus+Dining&locationNum=02&locationName=Butler+%26+Wilson+Colleges&naFlag=1';

var scrape = function scrape() {
  axios.get(url)
    .then(response => {
      fs.writeFile('./temp', response.data, function(err) {
        if (err) {
          return console.log(err);
        }
        console.log("Success");
      });
    });
}

module.exports.scrape = scrape;