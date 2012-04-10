var // DEFAULTS
lat = 37.76487,
lng = -122.41948,
zoom = 3,
minZoom = 3,
maxZoom = 16,
previousZoom = 3,
previousCenter;
var mapSyles = [
 {
   featureType: "water",
   stylers: [
     { saturation: -11 },
     { lightness: 25 }
   ]
 },{
   featureType: "poi",
   stylers: [
     { saturation: -95 },
     { lightness: 61 }
   ]
 },{
   featureType: "administrative",
   stylers: [
     { saturation: -99 },
     { gamma: 3.51 }
   ]
 },{
   featureType: "road",
   stylers: [
     { visibility: "off" }
   ]
 },{
   featureType: "road",
   stylers: [
     { visibility: "off" }
   ]
 },{
   featureType: "landscape",
   stylers: [
     { saturation: -85 },
     { lightness: 53 }
   ]
 },{
 }
];

var nexsoStyle = new google.maps.StyledMapType(mapSyles, {name: "Nexso Style"});

var projectsStyle      = { strokeColor: "#E79626", strokeOpacity: .5, strokeWeight: 1, fillColor: "#E79626", fillOpacity: .3 };
var projectsHoverStyle = { strokeColor: "#E79626", strokeOpacity: 1, strokeWeight: 2, fillColor: "#E79626", fillOpacity: .6 };

$(function() {

  // Key binding
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {  // esc
      infowindow.hide();
      $(".nav .filter").fadeOut(150);
    } 
  });

  $(".aside .close").on('click', function(e) {
    e.preventDefault();
    hideAside();
    map.setZoom(previousZoom);
    map.panTo(previousCenter);
  });

  function showAside() {
    $(".aside").animate({right:0}, 250);
  }

  function hideAside(callback) {
    $(".aside").animate({right:'-400px'}, 250, function() {
      callback && callback();
    });
  }

  // Slider
  // $( "#timeline .slider" ).slider({ range: true, min: 0, max: 500, step: 5, values: [ 75, 300 ], slide: function( event, ui ) { } });

  // Map
  var mapOptions = {
    zoom: zoom,
    minZoom: minZoom,
    maxZoom: maxZoom,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  function zoomIn(controlDiv, map) {
    controlDiv.setAttribute('class', 'zoom_in');

    google.maps.event.addDomListener(controlDiv, 'mousedown', function() {
      var zoom = map.getZoom() + 1;
      if (zoom<20) {
        map.setZoom(zoom);
      }
    });
  }

  function zoomOut(controlDiv, map) {
    controlDiv.setAttribute('class', 'zoom_out');

    google.maps.event.addDomListener(controlDiv, 'mousedown', function() {
      var zoom = map.getZoom() - 1;
      if (zoom>2) {
        map.setZoom(zoom);
      }
    });
  }

  var overlayID =  document.getElementById("zoom_controls");

  // zoomIn
  var zoomInControlDiv = document.createElement('DIV');
  overlayID.appendChild(zoomInControlDiv);
  var zoomInControl = new zoomIn(zoomInControlDiv, map);
  zoomInControlDiv.index = 1;

  // zoomOut
  var zoomOutControlDiv = document.createElement('DIV');
  overlayID.appendChild(zoomOutControlDiv);
  var zoomOutControl = new zoomOut(zoomOutControlDiv, map);
  zoomOutControlDiv.index = 2;



  map.mapTypes.set('nexsoStyle', nexsoStyle);
  map.setMapTypeId('nexsoStyle');

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
      this.state = 1;
      this.overlays = [];
      this.addAgencies();
      this.addAshokas();
      this.addProjects();
    },
    showOverlay: function(name, topic) {
      if (this.overlays[name]) {
        for (var i = 0; i < this.overlays[name].length; i++){
          if (this.overlays[name][i].geojsonProperties.topic == topic.replace('t', ''))
            this.overlays[name][i].setVisible(true);
        }
      }
    },
    hideOverlay: function(name, topic) {
      if (this.overlays[name]) {
        for (var i = 0; i < this.overlays[name].length; i++){
          if (this.overlays[name][i].geojsonProperties.topic == topic.replace('t', ''))
            this.overlays[name][i].setVisible(false);
        }
      }
    },
    removeOverlay: function(name) {
      if (name == "ashokas" || name == "agencies") {
        for (var i = 0; i < this.overlays[name].length; i++){
          this.overlays[name][i].setMap(null);
        }
      } else {

        if (this.overlays[name].length){
          for (var i = 0; i < this.overlays[name].length; i++){
            if(this.overlays[name][i].length){
              for(var j = 0; j < this.overlays[name][i].length; j++){
                this.overlays[name][i][j].setMap(null);
              }
            }
          }
        }
      }
    },
    addAshokas: function() {

      var query = "SELECT the_geom, ashoka_url AS url, topic_id AS topic, name " 
      + "FROM v1_ashoka " 
      + "WHERE the_geom IS NOT NULL AND topic_id IS NOT NULL";

      this.addOverlay("ashokas", query);

    },
    addAgencies: function() {

      var query = "SELECT the_geom, external_url AS url, name "
      + "FROM v1_agencies "
      + "WHERE the_geom IS NOT NULL";

      this.addOverlay("agencies", query);

    },
    addProjects: function() {

      // P = Projects | WA = Working Areas | PWA = Project Working Areas | S = Solutions
      var query = "SELECT P.title, P.approval_date, P.external_project_url, P.location_verbatim, P.budget, WA.the_geom, S.name AS solution_name, S.nexso_url AS solution_url "
      + "FROM v1_projects AS P LEFT JOIN v1_solutions AS S ON S.cartodb_id = P.solution_id, working_areas AS WA, v1_project_work_areas AS PWA "
      + "WHERE P.cartodb_id = PWA.project_id AND WA.cartodb_id = PWA.id";

      this.addOverlay("projects", query);

    },
    addOverlay: function(name, query) {
      var that = this;

      $.ajax({
        url: "https://nexso2.cartodb.com/api/v2/sql",
        data: { q: query, format:"geojson" },
        dataType: 'jsonp',
        success: function(data) {

          function showFeature(geojson, style){
            try {
              var data = JSON.parse(geojson);
            } catch ( e ) {
              var data = geojson;
            }

            that.overlays[name] = new GeoJSON(data, name, style || null);

            if (that.overlays[name].type && that.overlays[name].type == "Error"){
              return;
            }

            for (var i = 0; i < that.overlays[name].length; i++){
              if (that.overlays[name][i].length){

                // Circle Drawing
                var o = that.overlays[name][i][0];
                var cLatLng = new google.maps.LatLng(o.geojsonProperties.centroid_lat, o.geojsonProperties.centroid_lon);
                var rLatLng = new google.maps.LatLng(o.geojsonProperties.radius_point_lat, o.geojsonProperties.radius_point_lon);
                var distanceWidget = new DistanceWidget(map, cLatLng, rLatLng);
              }
            }

            if (that.overlays[name].length){
              for (var i = 0; i < that.overlays[name].length; i++){
                if (that.overlays[name][i].length){

                  for (var j = 0; j < that.overlays[name][i].length; j++){
                    var overlay = that.overlays[name][i][j];
                    overlay.setMap(map);

                    // Overlay events
                    google.maps.event.addListener(overlay, 'click', function(event) {

                      var 
                      that         = this,
                      properties   = this.geojsonProperties,
                      title        = properties.title,
                      approvalDate = properties.approval_date,
                      moreURL      = properties.external_project_url,
                      solutionName = properties.solution_name,
                      solutionURL  = properties.solution_url,
                      location     = properties.location_verbatim,
                      budget       = properties.budget;

                      console.log(solutionName, solutionURL);

                      infowindow.setContent(title, "project");
                      infowindow.setSolutionURL(title, moreURL);
                      infowindow.setCallback(function(e) {
                        e.preventDefault();

                        var prettyApprovalDate = prettifyDate(approvalDate);

                        function onHiddenAside() {
                          var 
                          $asideContent = $(".aside .content"),
                          $asideItems = $asideContent.find("ul");

                          $asideContent.find(".header h2").html(title);

                          if (prettyApprovalDate) {
                            $asideItems.find("li.approvalDate").show();
                            $asideItems.find("li.approvalDate span").text(prettyApprovalDate);
                          }
                          else $asideItems.find("li.approvalDate").hide();

                          if (location) $asideItems.find("li.location span").text(location);
                          if (budget)   $asideItems.find("li.budget span").text(accounting.formatMoney(budget));

                          if (solutionName && solutionURL) {
                            $asideItems.find("li.solution").show();
                            $asideItems.find("li.solution a").text(solutionName).attr("href", solutionURL);
                          } else $asideItems.find("li.solution").show();

                          if (moreURL) {
                            $asideItems.find("li.more").show();
                            $asideItems.find("li.more a").attr("href", moreURL);
                          }
                          else $asideItems.find("li.more").hide();

                          showAside();
                          infowindow.hide();

                          previousZoom = map.getZoom();
                          previousCenter = map.getCenter();

                          var bounds = new google.maps.LatLngBounds();
                          that.getPath().forEach( function(latlng) { bounds.extend(latlng); } ); 
                          map.fitBounds(bounds)
                        }

                        hideAside(onHiddenAside);
                      });
                      infowindow.open(event.latLng);
                    });

                    google.maps.event.addListener(overlay, 'mouseover', function(event) {
                      this.setOptions(projectsHoverStyle);
                    });

                    google.maps.event.addListener(overlay, 'mouseout', function(event) {
                      var projectsStyle      = { strokeColor: "#E79626", strokeOpacity: .5, strokeWeight: 1, fillColor: "#E79626", fillOpacity: .3 };
                      this.setOptions(projectsStyle);
                    });
                  }
                } else{
                  that.overlays[name][i].setMap(map);
                }
                if (that.overlays[name][i].geojsonProperties) {
                  infowindow.setup(that.overlays[name][i]);
                }
              }
            } else{
              that.overlays[name].setMap(map)
              if (that.overlays[name].geojsonProperties) {
                infowindow.setup(that.overlays[name]);
              }
            }
          }
          showFeature(data, projectsStyle);
        }
      });
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
          if (id == "agencies") mapView.addAgencies();
          else if (id == "ashokas") mapView.addAshokas();
          else if (id == "projects") mapView.addProjects();
          else if (c) {
            mapView.showOverlay("ashokas", c);
          }
        } else {
          if (id == "projects" || id == "agencies" || id == "ashokas") {
            mapView.removeOverlay(id);
          } else if (c){
            mapView.hideOverlay("ashokas", c);
          }
        }

        // Store the state of the element
        var id    = $(this).attr('id');
        var state = $(this).hasClass('selected');
        // if (state) {
        //   localStorage[id] = state;
        // } else {
        //   localStorage.removeItem(id);
        // }
      });
    }
  });

  var filterView = new FilterView({
    el:$('.nav .content')
  });
});
