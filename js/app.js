var // DEFAULTS
lat = 37.76487,
lng = -122.41948,
zoom = 3,
minZoom = 3;
maxZoom = 10;

var projectsStyle      = { strokeColor: "#EFC392", strokeOpacity: 1, strokeWeight: 2, fillColor: "#FBDBBA", fillOpacity: 0.5 };
var projectsHoverStyle = { strokeColor: "#EFC392", strokeOpacity: 1, strokeWeight: 2, fillColor: "#FBDBBA", fillOpacity: .7 };

$(function() {

  // Slider
  $( "#timeline .slider" ).slider({ range: true, min: 0, max: 500, step: 5, values: [ 75, 300 ], slide: function( event, ui ) { } });

  // Map
  var mapOptions = {
    zoom: zoom,
    minZoom: minZoom,
    maxZoom: maxZoom,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  google.maps.event.addListener(map, 'zoom_changed', function() {
    infowindow.hide();
    $(".stations").css({width:$(document).width(), height:$(document).height(), top:0, left:0});
  });

  // We reuse the same infowindow 
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
        this.layer.style("height", $(document).height() + this.state + "px");
        this.layer.style("top", 0);
        this.layer.style("left", 0);
      }
    },
    hideOverlay: function(c) {
      $(".marker."+ c).hide();
      this.updateLayer();
    },
    showOverlay: function(c) {
      $(".marker."+ c).show();
      this.updateLayer();
    },
    removeOverlay: function(c) {
      if (c == 'agencies') this.agencies.remove(this.agencies.models);
      else if (c == 'ashoka') this.ashoka.remove(this.ashoka.models);
      $(".marker."+ c).remove();
      this.updateLayer();
    },
    removePath: function() {
      if (this.projectsOverlay.length){
        for (var i = 0; i < this.projectsOverlay.length; i++){
          if(this.projectsOverlay[i].length){
            for(var j = 0; j < this.projectsOverlay[i].length; j++){
              this.projectsOverlay[i][j].setMap(null);
            }
          }
        }
      }
    },
    addPath: function() {
      var that = this;
      var url = "https://nexso2.cartodb.com/api/v2/sql/?q=SELECT the_geom FROM working_areas&format=geojson";
      //var url = "https://nexso2.cartodb.com/api/v2/sql?q=SELECT the_geom FROM v1_agencies&format=geojson";
      this.addOverlay(url);
    },
    addOverlay: function(url) {
      var that = this;
      $.ajax({
        url: url,
        success: function(data) {

          function setInfoWindow() {
          }

          function showFeature(geojson, style){
            that.projectsOverlay = new GeoJSON(geojson, style || null);
            if (that.projectsOverlay.type && that.projectsOverlay.type == "Error"){
              document.getElementById("put_geojson_string_here").value = that.projectsOverlay.message;
              return;
            }

            if (that.projectsOverlay.length){
              for (var i = 0; i < that.projectsOverlay.length; i++){
                if(that.projectsOverlay[i].length){
                  for(var j = 0; j < that.projectsOverlay[i].length; j++){
                    that.projectsOverlay[i][j].setMap(map);

                    // Overlay events
                    google.maps.event.addListener(that.projectsOverlay[i][j], 'mouseover', function(event) {
                      this.setOptions(projectsHoverStyle);
                    });
                    google.maps.event.addListener(that.projectsOverlay[i][j], 'mouseout', function(event) {
                      var projectsStyle = { strokeColor: "#EFC392", strokeOpacity: 1, strokeWeight: 2, fillColor: "#FBDBBA", fillOpacity: 0.5 };
                      this.setOptions(projectsStyle);
                    });

                  }
                }
                else{
                  that.projectsOverlay[i].setMap(map);
                }
                if (that.projectsOverlay[i].geojsonProperties) {
                  setInfoWindow(that.projectsOverlay[i]);
                }
              }
            }else{
              that.projectsOverlay.setMap(map)
              if (that.projectsOverlay.geojsonProperties) {
                setInfoWindow(that.projectsOverlay);
              }
            }

          }
          showFeature(data, projectsStyle);
        }
      });

    },

    addOverlay2: function(data, c) {
      //this.removeOverlay(c);

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

        function transform(point) {
          var latLng = new google.maps.LatLng(point.lat(), point.lng());
          var position = projection.fromLatLngToDivPixel(latLng);

          var markerClass;

          if (point.topic_id) {
            markerClass = "marker " + c + " t" + point.topic_id(); 
          } else {
            markerClass = "marker " + c; 
          }

          if (point.topic_id == null) return;

          return d3.select(this)
          .on('click', function(){ 
            infowindow.setContent(point.name(), c);
            infowindow.open(latLng);
          })
          .style("left", position.x + "px")
          .style("top", position.y + "px")
          .attr("class", markerClass);
        }
      };

      // Bind our overlay to the map…
      overlay.setMap(map);
    },
    renderAgencies: function() {
      this.addOverlay2(this.agencies.models, 'agencies');
    },
    renderAshoka: function() {
      this.addOverlay2(this.ashoka.models, 'ashoka');
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

        var id = $(this).attr('id').trim();
        var c  = $(this).attr('class').replace(/selected/, "").trim();

        if ($(this).hasClass('selected')) {
          if (id == "agencies") agencies.fetch();
          else if (id == "ashoka") ashoka.fetch();
          else if (id == "projects") mapView.addPath();
          else {
            mapView.showOverlay(c);
          }
        } else {
          if (id == "agencies" || id == "ashoka") {
            mapView.removeOverlay(id);
          } 
          else if (id == "projects") mapView.removePath();
          else {
            mapView.hideOverlay(c);
          }
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





