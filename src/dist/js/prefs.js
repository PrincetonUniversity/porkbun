// Add dish preference asynchronously
$('#dish-submit').click(() => {
  let dish = $('#dish-input').val();
  $.post('/prefs', {
    dish: dish
  }, 
  data => {
    if (data == 'Success') {
      $('#dish-list').append(
        `<li class="list-group-item">
          ${dish} 
          <a class='remove' href='/prefs/remove?dish=${dish}'>(remove)</a>
        </li>`
      );
    }
  });
});