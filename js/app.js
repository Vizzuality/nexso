$(function() {

  $( "#timeline .slider" ).slider({ range: true, min: 0, max: 500, step: 5, values: [ 75, 300 ], slide: function( event, ui ) { } });
  // console.log( "$" + $( "#slider-range" ).slider( "values", 0 ) + " - $" + $( "#slider-range" ).slider( "values", 1 ) );

  var myOptions = {
    zoom: 3,
    center: new google.maps.LatLng(37.76487, -122.41948),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(d3.select("#map").node(), myOptions);

  var infowindow = new InfoWindow({map:map});
  // generate CartoDB object linked to examples account.
  var CartoDB = Backbone.CartoDB({
    user: 'nexso2' // you should put your account name here
  });

  var Point = CartoDB.CartoDBModel.extend({
    name: function() {
      return this.get('name');
    },

    lat: function() {
      if (!this.get('location')) return 0;
      return this.get('location').coordinates[1];
    },

    lng: function() {
      if (!this.get('location')) return 0;
      return this.get('location').coordinates[0];
    }
  });

  var Ashoka = CartoDB.CartoDBCollection.extend({
    model: Point,
    table: 'v1_ashoka', //public table
    columns: {
      'name': 'name',
      'location': 'the_geom'
    }
  });

  var Agencies = CartoDB.CartoDBCollection.extend({
    model: Point,
    table: 'v1_agencies', //public table
    columns: {
      'name': 'name',
      'location': 'the_geom'
    }
  });

  // some helper view to show how to use the model
  var MapView = Backbone.View.extend({
    events: {
    },

    initialize: function() {
      this.ashoka = this.options.ashoka;
      this.agencies = this.options.agencies;
      this.agencies.bind('reset', this.render, this);
      this.ashoka.bind('reset', this.render, this);
    },

    addOverlay: function(data, c) {
      var overlay = new google.maps.OverlayView();

      // Add the container when the overlay is added to the map.
      overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("class", "stations");

        // Draw each marker as a separate SVG element.
        overlay.draw = function() {
          var projection = this.getProjection();

          var markers = layer.selectAll("svg")
          .data(data)
          .each(transform) // update existing markers
          .enter().append("svg:svg")
          .each(transform)
          .attr("class", "marker " + c);

          function transform(d) {
          var m = d;

            var latLng = new google.maps.LatLng(d.lat(), d.lng());
            d = new google.maps.LatLng(d.lat(), d.lng());
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
            .on('click', function(){ 
              infowindow.setContent(m.name());
              infowindow.open(latLng);
            }).style("left", d.x + "px")
            .style("top", d.y + "px");
          }
        };
      };

      // Bind our overlay to the map…
      overlay.setMap(map);

    },

    render: function() {
      var self = this;

      this.addOverlay(this.agencies.models, 'green');
      this.addOverlay(this.ashoka.models, 'orange');
    }
  });

  var agencies = new Agencies();
  var ashoka   = new Ashoka();

  var mapView = new MapView({
    el:$('#map'),
    ashoka: ashoka,
    agencies: agencies
  });

  // some helper view to show how to use the model
  var FilterView = Backbone.View.extend({
    initialize: function() {
      this.$(".filter ul.ticks li").on("click", function(e) {
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
    }
  });

  var filterView = new FilterView({
    el:$('nav .content')
  });
      agencies.fetch();
      ashoka.fetch();

});
