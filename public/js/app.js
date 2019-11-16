
//jQuery to hide search information and show the add book form
$(document).ready(function(){
  $('.add-book-form-button').click(function(){
    $('.hide-add-book-form').show();
    $('.book-container').hide();
  });
});
