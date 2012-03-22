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


    $( "#timeline .slider" ).slider({
        range: true,
        min: 0,
        max: 500,
        step: 5,
        values: [ 75, 300 ],
        slide: function( event, ui ) {
            //console.log( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
        }
    });
    // console.log( "$" + $( "#slider-range" ).slider( "values", 0 ) + " - $" + $( "#slider-range" ).slider( "values", 1 ) );

    $(document).on("click", function() {
        if ($("nav a[data-toggle='filter']").hasClass('selected')){
            $("nav a[data-toggle='filter']").removeClass('selected');
            $(".filter").fadeOut(150);
        }
    });

    // Ticks initialization
    $("ul.radio li, ul.ticks li").each(function(i, e) {
        var id = $(e).attr('id');
        if (localStorage[id]) $(e).addClass('selected');
    });

    if ($("ul.radio li.selected").length <= 0) $("ul.radio li:first-child").addClass("selected");

    $("nav a[data-toggle='filter']").on("click", function(e) {
        e.stopPropagation();

        $("nav a[data-toggle='filter'].selected").not(this).removeClass("selected");
        $(this).toggleClass("selected");

        $("nav a[data-toggle='filter']").not(this).parent().find(".filter").fadeOut(250);
        $(this).parent().find(".filter").fadeToggle(150);
    });

    $(".filter ul.ticks li").on("click", function(e) {
        e.stopPropagation();
        $(this).toggleClass("selected");

        // Store the state of the element
        var id    = $(this).attr('id');
        var state = $(this).hasClass('selected');
        if (state) {
            localStorage[id] = state;
        } else {
            localStorage.removeItem(id);
        }
    });

    $(".filter ul.radio li").on("click", function(e) {
        e.stopPropagation();
        $(this).parent().find("li").each(function() {
            var id = $(this).attr('id');
            localStorage.removeItem(id);
        });

        $(this).parent().find("li").removeClass("selected");
        $(this).addClass("selected");

        // Store the state of the element
        var id = $(this).attr('id');
        localStorage[id] = true;
    });

    $(".filter").on("click", function(e) {
        e.stopPropagation();
    });
});
