$(function() {

  $( "#timeline .slider" ).slider({ range: true, min: 0, max: 500, step: 5, values: [ 75, 300 ], slide: function( event, ui ) { } });
  // console.log( "$" + $( "#slider-range" ).slider( "values", 0 ) + " - $" + $( "#slider-range" ).slider( "values", 1 ) );

  var myOptions = {
    zoom: 3,
    center: new google.maps.LatLng(37.76487, -122.41948),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(d3.select("#map").node(), myOptions);

  google.maps.event.addListener(map, 'zoom_changed', function() {
    infowindow.hide();
  });


  var infowindow = new InfoWindow({map:map});
  // generate CartoDB object linked to examples account.
  var CartoDB = Backbone.CartoDB({
    user: 'nexso2' // you should put your account name here
  });

  var Point = CartoDB.CartoDBModel.extend({
    topic_id: function() {
      return this.get('topic_id');
    },
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
      'location': 'the_geom',
      'topic_id': 'topic_id'
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
      this.ashoka   = this.options.ashoka;
      this.agencies = this.options.agencies;
      this.agencies.bind('reset', this.renderAgencies, this);
      this.ashoka.bind('reset', this.renderAshoka, this);
      this.state = 1;
    },
    updateLayer: function() {
      this.state = -1 + -1*this.state;
      if (this.layer) { // There's a bug on Chrome, we need to grow/shrink the layer in order for it to show the markers
        this.layer.style("width", $(document).width() + this.state + "px");
      }
    },
    removeOverlay: function(c) {
      $(".marker."+ c).remove();
      this.updateLayer();
    },
    addPath: function() {

      d3.json("https://nexso2.cartodb.com/api/v2/sql/?q=SELECT%20ST_ASGEOJSON(the_geom)%20as%20the_geom%20FROM%20v1_projects%20WHERE%20the_geom%20IS%20NOT%20NULL", function(collection) {
      var self = this;
      var overlay = new google.maps.OverlayView();

      overlay.onAdd = function() {
      // The radius scale for the centroids.
      var r = d3.scale.sqrt()
      .domain([0, 1e6])
      .range([0, 10]);

      function redraw() {
        //self.layer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }
      //console.log(collection.rows);
      // Our projection.
      var xy = d3.geo.mercator();
      self.layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
      .append("svg")
      .call(d3.behavior.zoom()
      .on("zoom", redraw))
      .append("g");

      self.layer.append("g").attr("id", "counties");
      self.layer.append("g").attr("id", "states");

        self.layer.select("#counties")
        .selectAll("path")
        .data(collection.rows)
        .enter().append("path")
        .each(transform)
        .attr("fill", "#559")
        .attr("stroke", "black")
        .attr("stroke-width", "0.2")
        .attr("opacity", 1.0)
        .attr("d", d3.geo.path().projection(xy));
      }
      function transform(d) {
      console.log(d);
      return d;

      }

      overlay.draw = function() {
        //var projection = this.getProjection();

        //var lat = collection.features[0].geometry.coordinates[0]; 
        //var lng = collection.features[1].geometry.coordinates[0]; 

        //  var latLng = new google.maps.LatLng(lat, lng);
        //  var d = new google.maps.LatLng(lat, lng);
        //  d = projection.fromLatLngToDivPixel(d);

        //  console.log(d3.select(this));
        //  return d3.select(this)
        //  .style("left", d.x + "px")
        //  .style("top", d.y + "px");

        //  //self.layer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }
      overlay.setMap(map);
      });
    },

    addOverlay: function(data, c) {
      this.removeOverlay(c);

      var self = this;
      var overlay = new google.maps.OverlayView();

      overlay.onRemove = function() { }
      // Add the container when the overlay is added to the map.
      overlay.onAdd = function() {

        if (!self.layer) {
          self.layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
          .attr("class", "stations")
          .style("width", $(document).width() + "px")
          .style("height", $(document).height() + "px");
        } else {
          self.updateLayer();
        }
      }

      // Draw each marker as a separate SVG element.
      overlay.draw = function() {
        var projection = this.getProjection();

        var markers = self.layer.selectAll("svg." + c)
        .data(data)
        .each(transform) // update existing markers
        .enter().append("svg:svg")
        .each(transform);

        function transform(d) {
          var m = d;

          var latLng = new google.maps.LatLng(d.lat(), d.lng());
          d = new google.maps.LatLng(d.lat(), d.lng());
          d = projection.fromLatLngToDivPixel(d);
          
          var markerClass;

          if (m.topic_id) {
             markerClass = "marker " + c + " t_" + m.topic_id(); 
          } else {
             markerClass = "marker " + c; 
          }
          return d3.select(this)
          .on('click', function(){ 
            infowindow.setContent(m.name(), c);
            infowindow.open(latLng);
          })
          .style("left", d.x + "px")
          .style("top", d.y + "px")
          .attr("class", markerClass);
        }
      };

      // Bind our overlay to the map…
      overlay.setMap(map);
    },
    renderAgencies: function() {
      this.addPath();
      //this.addOverlay(this.agencies.models, 'agencies');
    },
    renderAshoka: function() {
      this.addOverlay(this.ashoka.models, 'ashoka');
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
        var id = $(this).attr('id');

          if ($(this).hasClass('selected')) {
            if (id == "agencies") agencies.fetch();
            if (id == "ashoka") ashoka.fetch();
          } else {
            if (id == "agencies") mapView.removeOverlay(id);
            if (id == "ashoka") mapView.removeOverlay(id);
          }

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

});





