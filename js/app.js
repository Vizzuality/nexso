var // DEFAULTS
lat = 3.162456,
lng = -73.476563,
zoom = 3,
minZoom = 3,
maxZoom = 16,
previousZoom = 3,
previousCenter,
mapView;

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
    hideAside(showTimeline);
    map.setZoom(previousZoom);
    map.panTo(previousCenter);
  });

  function showTimeline() {
    if ($(".aside").hasClass("hidden"))
      $("#timeline").animate({bottom:19, opacity:1}, 300);
  }

  function hideTimeline(callback) {
    $("#timeline").animate({bottom:-19, opacity:0}, 250, function() {
      callback && callback();
    });
  }

  function showAside() {
    $(".aside").animate({right:0}, 250, function() {
    $(this).removeClass("hidden");
    });
  }

  function hideAside(callback) {
    $(".aside").animate({right:'-400px'}, 250, function() {
      $(this).addClass("hidden");
      callback && callback();
    });
  }

  var years = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];

  // Slider
  $( "#timeline .slider" ).slider({ range: true, min: 0, max: 13*30, step: 30, values: [ 0, 500 ], 
  stop: function(event, ui) {
    var beginYear = years[(ui.values[0]/30)];
    var endYear = years[(ui.values[1]/30) - 1];
    mapView.beginYear = beginYear;
    mapView.endYear   = endYear;
    mapView.removeOverlay("projects");
    mapView.addProjects();
  },
  slide: function( event, ui ) {
    $('#timeline li').removeClass("selected");
    var min = (ui.values[0]/30) + 1;
    var max = (ui.values[1]/30);
    for (var i = min; i<=max; i++) {
      $('#timeline li:nth-child('+i+')').addClass("selected");
    }
  }});

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

  google.maps.event.addDomListener(map, 'tilesloaded', function() {
     setTimeout(function() { if ($(".aside").hasClass("hidden")) showTimeline(); }, 700);
  });

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
      this.beginYear = 2002;
      this.endYear   = 2014;
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

      if (!this.beginYear) this.beginYear = 2002;
      if (!this.endYear)   this.endYear   = 2014;

      // P = Projects | WA = Working Areas | PWA = Project Working Areas | S = Solutions | A = Agencies

      // var query = "SELECT P.title, P.fixed_approval_date, P.approval_date, P.external_project_url, P.location_verbatim, P.budget, "
      //  "ST_Simplify(WA.the_geom, 0.2) AS the_geom, S.name AS solution_name, S.nexso_url AS solution_url, "
      //  "A.agency_code, A.external_url AS agency_url, A.name as agency_name "
      //  "FROM v1_projects AS P LEFT JOIN v1_solutions AS S ON S.cartodb_id = P.solution_id LEFT JOIN v1_agencies AS A ON A.cartodb_id = P.agency_id, working_areas AS WA, v1_project_work_areas AS PWA "
      //  "WHERE P.cartodb_id = PWA.project_id AND WA.cartodb_id = PWA.id "
      //  " AND EXTRACT(YEAR FROM P.fixed_approval_date) >= " + this.beginYear + " AND EXTRACT(YEAR FROM P.fixed_approval_date) <= " + this.endYear;


      var query = "WITH qu as (WITH hull as (SELECT v1_projects.title, v1_projects.approval_date, v1_projects.external_project_url, v1_projects.location_verbatim, v1_projects.budget, ST_MemUnion(ST_Simplify(working_areas.the_geom,0.0001)) as the_geom FROM v1_projects, working_areas, v1_project_work_areas WHERE v1_projects.cartodb_id = v1_project_work_areas.project_id AND working_areas.cartodb_id = v1_project_work_areas.id group by title,approval_date,external_project_url,location_verbatim,budget) SELECT *,ST_ConvexHull(ST_Envelope(the_geom)) as hull_geom FROM hull) SELECT title,approval_date,external_project_url,location_verbatim,budget,the_geom,ST_X(ST_Centroid(hull_geom)) as centroid_lon,ST_Y(ST_Centroid(hull_geom)) as centroid_lat, ST_X(ST_EndPoint(ST_LongestLine(ST_Centroid(hull_geom),hull_geom))) as radius_point_lon,ST_Y(ST_EndPoint(ST_LongestLine(ST_Centroid(hull_geom),hull_geom))) as radius_point_lat FROM qu";

      this.addOverlay("projects", query);
    },
    addOverlay: function(name, query) {
      var that = this;

      $.ajax({
        url: "https://nexso2.cartodb.com/api/v2/sql",
        data: { q: query, format:"geojson" },
        dataType: 'jsonp',
        success: function(data) {

          if (data.features.length <= 0) return; 

          function showFeature(geojson, style){
            try {
              var data = JSON.parse(geojson);
            } catch ( e ) {
              var data = geojson;
            }

            // Clone style hash so 'style' is not overwritten
            var overlayStyle = $.extend({}, style);

            that.overlays[name] = new GeoJSON(data, name, overlayStyle || null);

            if (that.overlays[name].type && that.overlays[name].type == "Error"){
              return;
            }

  

            var polygons_;

            if (that.overlays[name].length){
              for (var i = 0; i < that.overlays[name].length; i++){
                if (that.overlays[name][i].length){

                  polygons_ = [];

                  // Draw polygons

                  for (var j = 0; j < that.overlays[name][i].length; j++){
                    var overlay = that.overlays[name][i][j];
                    overlay.setMap(map);

                    polygons_.push(overlay);

                    // Overlay events
                    // google.maps.event.addListener(overlay, 'mouseover', function(event) {
                    //   this.setOptions(projectsHoverStyle);
                    // });

                    // google.maps.event.addListener(overlay, 'mouseout', function(event) {
                    //   this.setOptions(projectsStyle);
                    // });
                    google.maps.event.addListener(overlay, 'click', function(event) {

                      var 
                      that         = this,
                      properties   = this.geojsonProperties,
                      title        = properties.title,
                      approvalDate = properties.approval_date,
                      fixedApprovalDate = properties.approval_date,
                      moreURL      = properties.external_project_url,
                      solutionName = properties.solution_name,
                      solutionURL  = properties.solution_url,
                      // agencyName   = properties.agency_name,
                      // agencyURL    = properties.agency_url,
                      location     = properties.location_verbatim,
                      budget       = properties.budget;

                      function onHiddenAside() {
                        var 
                        $asideContent = $(".aside .content"),
                        $asideItems = $asideContent.find("ul");

                        $asideContent.find(".header h2").html(title);

                        var prettyApprovalDate = prettifyDate(approvalDate);
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

                        // Focus on the overlay
                        var bounds = new google.maps.LatLngBounds();
                        that.getPath().forEach( function(latlng) { bounds.extend(latlng); } ); 
                        map.fitBounds(bounds)
                      }

                      function onInfowindowClick(e) {
                        e.preventDefault();
                        hideTimeline();
                        hideAside(onHiddenAside);
                      }

                      // Infowindow setup
                      infowindow.setContent(title, "project");
                      infowindow.setSolutionURL(title, moreURL);
                      infowindow.setCallback(onInfowindowClick);
                      infowindow.open(event.latLng);
                    });
                  }

                  // Draw circles
                  var o = that.overlays[name][i][0]
                    , cLatLng = new google.maps.LatLng(o.geojsonProperties.centroid_lat, o.geojsonProperties.centroid_lon)
                    , rLatLng = new google.maps.LatLng(o.geojsonProperties.radius_point_lat, o.geojsonProperties.radius_point_lon)
                    , distanceWidget = new RadiusWidget(map, cLatLng, rLatLng, that.overlays[name][i]);

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

  mapView = new MapView({
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
