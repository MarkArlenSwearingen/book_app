'use strict'
//jQuery to hide search information and show the add book form
$(document).ready(function(){
  $('.hide-add-book-form').hide();

  $('.show-add-book-form').click(function(){
    $('.hide-add-book-form').show();
  });
});
