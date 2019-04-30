// Dish preferences -----------------------------------------------------------

// create dishPrefs array for frontend
let dishPrefs = new Set();
$('span.dish-item').each(function() {
  dishPrefs.add($(this).text());
});

// Add dish preference asynchronously and add to page
$('#dish-submit').click(function() {
  $.post('/prefs', {
    dish: $('#dish-input').val()
  }, 
  res => {
    if (res && !dishPrefs.has(res)) {
      $('#dishprefs').append(
        `<li class="list-group-item" data-dishname=${res}>
          <span class='dish-item'>${res}</span>  
          <a class='remove' href='/prefs/remove?dish=${res}'>(remove)</a>
        </li>`);
      dishPrefs.add(res);
    }
  });
  $('#dish-input').val('');
});

// Location preferences -------------------------------------------------------
const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const meals = ['breakfast', 'lunch', 'dinner'];

// create locationPrefs object for frontend
let locationPrefs = {};
for (day of days) {
  locationPrefs[day] = {};
  for (meal of meals) {
    locationPrefs[day][meal] = new Set();
    $(`ul#${day}-${meal} li span`).each(function() {
      locationPrefs[day][meal].add($(this).text());
    });
  }
}

// switches to a tab showing given day
function switchTabs(day) {
  $('div.show.active').removeClass('show active');
  $('a.nav-link.active').removeClass('active');
  $(`#${day}`).addClass('show active');
  $(`a[href='#${day}']`).addClass('active');
}

// Add location preference asynchronously and add to page
function addPref(day, meal, dhall) {
  if (day == 'all')
    days.forEach(d => { addPref(d, meal, dhall) });
  else if (meal == 'all')
    meals.forEach(m => { addPref(day, m, dhall) });
  else if (!locationPrefs[day][meal].has(dhall)) {
    $(`#${day}-${meal}`).append(
      `<li>
        <span>${dhall}</span>
        <a class="remove" href='/prefs/remove?dhall=${dhall}&meal=${meal}&day=${day}'>remove</a>
      </li>`);
    locationPrefs[day][meal].add(dhall);
  }
} 

$('#loc-submit').click(function() {
  $.post('/prefs/locs', {
    dhall: $('#dhall').val(),
    meal: $('#meal').val(),
    day: $('#day').val()
  }, 
  res => { 
    if (res) {
      addPref(res.day, res.meal, res.dhall); 
      if (res.day != 'all') switchTabs(res.day);
    }
  });
});

// Drag and drop functionality
$(function() {
  $(".dhall-list").sortable({
    stop: function () {
      let ranked = [];
      $(this).children().children('span').each(function() {
        ranked.push($(this).text());
      });

      let id = $(this).attr('id'); // id format: '[day]-[meal]'
      $.post('prefs/rank', {
        day: id.substr(0, id.indexOf('-')),
        meal: id.substr(id.indexOf('-')+1),
        dhalls: ranked
      });
    }
  });
});
