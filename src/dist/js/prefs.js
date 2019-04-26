// create dishPrefs array for frontend
let dishPrefs = new Set();
$('span.dish-item').each(function() {
  dishPrefs.add($(this).text());
});

// Add dish preference asynchronously
$('#dish-submit').click(function() {
  let dish = $('#dish-input').val();
  $.post('/prefs', {
    dish: dish
  }, 
  res => {
    if (res == 'Success' && !dishPrefs.has(dish)) {
      $('#dish-list').append(
        `<li class="list-group-item" data-dishname=${dish}>
          <span class='dish-item'>${dish}</span>  
          <a class='remove' href='/prefs/remove?dish=${dish}'>(remove)</a>
        </li>`);
      dishPrefs.add(dish);
      $('#dish-input').val('');
    }
  });
});