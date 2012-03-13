function initialize() {
  var myOptions = {
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map"),
      myOptions);
}

$(function() {

    $("nav a.toggle-filter").on("click", function() {
        $(this).toggleClass("selected");
        $(".filter").fadeToggle(150);
    });

    $(".filter ul.ticks li").on("click", function() {
        $(this).toggleClass("selected");
    });

    $(".filter ul.radio li").on("click", function() {
        $(this).parent().find("li").removeClass("selected");
        $(this).addClass("selected");
    });

});
