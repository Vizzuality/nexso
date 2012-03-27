$(function() {

  $( "#timeline .slider" ).slider({ range: true, min: 0, max: 500, step: 5, values: [ 75, 300 ], slide: function( event, ui ) { } });
  // console.log( "$" + $( "#slider-range" ).slider( "values", 0 ) + " - $" + $( "#slider-range" ).slider( "values", 1 ) );

  var myOptions = {
    zoom: 3,
    center: new google.maps.LatLng(37.76487, -122.41948),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(d3.select("#map").node(), myOptions);

  // generate CartoDB object linked to examples account.
  var CartoDB = Backbone.CartoDB({
    user: 'nexso2' // you should put your account name here
  });

  var Wifi = CartoDB.CartoDBModel.extend({

    lat: function() {
      return this.get('location').coordinates[1];
    },

    lng: function() {
      return this.get('location').coordinates[0];
    }
  });

  var WifiPlaces= CartoDB.CartoDBCollection.extend({
    model: Wifi,
    table: 'v1_agencies', //public table
    columns: {
      'name': 'name',
      'location': 'the_geom'
    }

  });

  // some helper view to show how to use the model
  var ListView = Backbone.View.extend({
    events: {
      'click .free': 'filter_free',
      'click .fee': 'filter_fee'
    },

    initialize: function() {
      this.wifi = this.options.wifi;
      this.wifi .bind('reset', this.render, this);
    },

    filter_free: function() {
      this.wifi.where = "type = 'Free'"
      this.$('ul').html('loading...');
      this.wifi.fetch();
    },

    filter_fee: function() {
      this.wifi.where = "type = 'Fee-based'"
      this.$('ul').html('loading...');
      this.wifi.fetch();
    },

    render: function() {
      var self = this;

      var data = this.wifi.models;

      var overlay = new google.maps.OverlayView();

      // Add the container when the overlay is added to the map.
      overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "stations");

        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function() {
          var projection = this.getProjection(),
          padding = 10;

          var marker = layer.selectAll("svg")
          .data(data)
          .each(transform) // update existing markers
          .enter().append("svg:svg")
          .each(transform)
          .attr("class", "marker");

          function transform(d) {
            d = new google.maps.LatLng(d.lat(), d.lng());
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
          }
        };
      };

      // Bind our overlay to the map…
      overlay.setMap(map);


    }
  });

  var wifi_places = new WifiPlaces();
  var wifi_list = new ListView({
    el:$('#wifi_list'),
    wifi: wifi_places
  });
  wifi_places.fetch();


});
