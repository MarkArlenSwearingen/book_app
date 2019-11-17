
//jQuery to hide search information and show the add book form
$(document).ready(function(){
  $('.hide-add-book-form').hide();

  $('.show-add-book-form').click(function(){
//TODO: hide all the other books or the form for them
    $('.hide-add-book-form').show();
    // $('.book-container').hide();
  });
});

//Holly Davis provided code below
// $('.show-add-book-form').on('click', function() {
//   $(this).next().removeClass('hide-me');
// });
