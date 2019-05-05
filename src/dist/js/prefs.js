// Dish preferences -----------------------------------------------------------

// create dishPrefs array for frontend
let dishPrefs = new Set();
$('span.dish-item').each(function() {
  dishPrefs.add($(this).text());
});

// Append autocomplete entries based on changes to input field
$('#dish-input').on('input', function() {
  $.post('/prefs/auto', {
    input: $('#dish-input').val()
  }, res => {
    $('#autocomplete').empty();
    $('#autocomplete').css('height', `${res.length * 55}px`);
    res.forEach(item => {
      $('#autocomplete').append(
        `<li class='list-group-item autocomplete-item'>
          ${item}
        </li>`
      );
    });
  });
});

// Add dish preference based on click to a suggested autocomplete
$(document).on('click', '.autocomplete-item', function() {
  $.post('/prefs', {
    dish: $(this).text()
  }, res => {
    if (res && !dishPrefs.has(res)) {
      $('#dishprefs').append(
        `<li class="list-group-item" data-dishname=${res}>
          <span class='dish-item'>${res}</span>  
          <span class='remove'>(remove)</a>
        </li>`
      );
      dishPrefs.add(res);
    }
  });
  $('#dish-input').val('');
  $('#autocomplete').empty();
  $('#autocomplete').css('height', '0px');
});

// Add dish preference asynchronously and add to page
$('#dish-submit').click(function() {
  $.post('/prefs', {
    dish: $('#dish-input').val()
  }, res => {
    if (res && !dishPrefs.has(res)) {
      $('#dishprefs').append(
        `<li class="list-group-item" data-dishname=${res}>
          <span class='dish-item'>${res}</span>  
          <span class='remove'>(remove)</span>
        </li>`
      );
      dishPrefs.add(res);
    }
  });
  $('#dish-input').val('');
  $('#autocomplete').empty();
  $('#autocomplete').css('height', '0px');
});

// Delete a dish asynchronously and remove from page
$(document).on('click', '.dish-item + .remove', function() {
  $.post(`/prefs/remove`, {
    dish: $(this).prev().text()
  }, res => {
      dishPrefs.delete(res); 
      $(this).parent().remove();
    });
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
    $(`#${day}-${meal} li .dhall-item`).each(function() {
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
        <span class="dhall-item">${dhall}</span>
        <span class="remove">remove</span>
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

// Location prefs drag and drop functionality
$(function() {
  $(".dhall-list").sortable({
    stop: function () {
      let ranked = [];
      $(this).children().children('.dhall-item').each(function() {
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

// Delete a location pref asynchronously and remove from page
$(document).on('click', '.dhall-item + .remove', function() {
  let id = $(this).parent().parent().attr('id');
  $.post(`/prefs/remove`, {
    dhall: $(this).prev().text(),
    day: id.substr(0, id.indexOf('-')),
    meal: id.substr(id.indexOf('-')+1)
  }, res => {
      locationPrefs[day][meal].delete(res.dhall); 
      $(this).parent().remove();
    });
});
