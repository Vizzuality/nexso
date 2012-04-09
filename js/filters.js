$(function() {

  $(document).on("click", function() {
    if ($("nav a[data-toggle='filter']").hasClass('selected')){
      $("nav a[data-toggle='filter']").removeClass('selected');
      $("nav .filter").fadeOut(150);
    }
  });

  // Ticks initialization
  // $("ul.radio li, ul.ticks li").each(function(i, e) {
  //   var id = $(e).attr('id');
  //   if (localStorage[id]) $(e).addClass('selected');
  // });

  if ($("ul.radio li.selected").length <= 0) $("ul.radio li:first-child").addClass("selected");

  $("nav a[data-toggle='filter']").on("click", function(e) {
    e.stopPropagation();

    $("nav a[data-toggle='filter'].selected").not(this).removeClass("selected");
    $(this).toggleClass("selected");

    $("nav a[data-toggle='filter']").not(this).parent().find(".filter").fadeOut(250);
    $(this).parent().find(".filter").fadeToggle(150);
  });

  $("nav .filter ul.radio li").on("click", function(e) {
    e.stopPropagation();
    $(this).parent().find("li").each(function() {
      var id = $(this).attr('id');
    //  localStorage.removeItem(id);
    });

    $(this).parent().find("li").removeClass("selected");
    $(this).addClass("selected");

    // Store the state of the element
    var id = $(this).attr('id');
    //localStorage[id] = true;
  });

  $("nav .filter").on("click", function(e) {
    e.stopPropagation();
  });
});
