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

    $(document).on("click", function() {
        if ($("nav a.toggle-filter").hasClass('selected')){
            $("nav a.toggle-filter").removeClass('selected');
            $(".filter").fadeOut(150);
        }
    });

    $("nav a.toggle-filter").on("click", function(e) {
        e.stopPropagation();
        $(this).toggleClass("selected");
        $(".filter").fadeToggle(150);
    });

    $(".filter ul.ticks li").on("click", function(e) {
        e.stopPropagation();
        $(this).toggleClass("selected");
    });

    $(".filter ul.radio li").on("click", function(e) {
        e.stopPropagation();
        $(this).parent().find("li").removeClass("selected");
        $(this).addClass("selected");
    });

    $(".filter").on("click", function(e) {
        e.stopPropagation();
    });
});
